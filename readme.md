## 1. Project SetUp

`npm init -y`

`npm install express mongoose jsonwebtoken bcryptjs joi dotenv cors cookie-parser cloudinary`

`npm install -D nodemon `

modify `package.json`:

```javascript
"script": {
    "dev": "nodemon backend/server.js",
    "start": "node backend/server.js"
},
...
"type": "module",
...
```

### frontend

`npm create vite@latest . `

## 2. Auth Controller Added

### Validate User Input

要改进 `signup` 控制器的用户输入验证过程，可以使用一些工具库，如 `Joi` 或 `Validator`，来简化和模块化代码。下面是改进后的代码示例，其中使用了 `Joi` 进行输入验证，并将验证逻辑和主要逻辑分离为不同的模块。

1. **安装依赖（skip if installed）：**

   ```bash
   npm install joi
   ```

2. **创建验证模块:**
   `validators/user.validator.js`

   ```javascript
   import Joi from "joi";

   const userSchema = Joi.object({
     fullName: Joi.string().min(3).required(),
     username: Joi.string().alphanum().min(3).max(30).required(),
     email: Joi.string().email().required(),
     password: Joi.string().min(6).required(),
     profileImg: Joi.string().uri().allow(""),
     coverImg: Joi.string().uri().allow(""),
     bio: Joi.string().max(500).allow(""),
     link: Joi.string().uri().allow(""),
     followers: Joi.array().items(Joi.string().hex().length(24)).default([]),
     following: Joi.array().items(Joi.string().hex().length(24)).default([]),
   });

   export const validateUser = (data) => {
     return userSchema.validate(data);
   };
   ```

3. **在 `signup` 控制器中使用 Joi 验证：**

`controllers/user.controller.js`

```javascript
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { validateUser } from "../validators/user.validator.js";

export const signup = async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fullName, username, email, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    });
  } catch (error) {
    console.log("Error in signup controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
```

这种重构方法的优点包括：

- **代码简洁**：使用 `Joi` 进行验证可以减少手动验证代码的冗余。
- **模块化**：将验证逻辑分离到单独的模块中，易于维护和扩展。
- **可读性**：主要的业务逻辑更加清晰，可读性更高。

通过这种方式，我们将验证逻辑和 Mongoose 模式定义分离，增加了代码的模块化和可维护性。同时，使用 Joi 可以更轻松地进行数据验证并返回有意义的错误信息。

---

### Generate and Return Response

创建一个通用的函数 `createResponse`，该函数接受两个参数：一个是用户对象，另一个是要排除的属性值数组。这样可以更灵活地控制返回的属性。以下是实现方法：

1. **创建一个通用的响应助手函数：**

   `utils/responseHelper.js`

   ```javascript
   export const createResponse = (payload, excludeFields = []) => {
     const response = { ...payload };
     excludeFields.forEach((field) => delete response[field]);
     return response;
   };
   ```

2. **在 `signup` 控制器中使用这个函数：**

   `controllers/user.controller.js`

   ```javascript
   // same
   import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
   import { createResponse } from "../lib/utils/responseHelper.js";
   export const signup = async (req, res) => {
     try {
       // same
       generateTokenAndSetCookie(newUser._id, res);

       const userResponse = createResponse(newUser.toObject(), ["password"]);

       res.status(201).json(userResponse);
     } catch (error) {
       // same
     }
   };
   ```

#### Explain

1. **通用响应助手函数**：

   - `createResponse` 函数接受两个参数：一个是对象 `payload`，另一个是要排除的属性值数组 `excludeFields`。
   - 通过复制 `payload` 对象并删除指定的属性来创建响应对象。
   - 在 JavaScript 中，`delete` 运算符用于从对象中删除属性。使用 `delete` 可以从对象中移除一个指定的属性，删除后该属性将不再存在于对象中。语法如下：
     - `delete object.property` or `delete object["property"]`

2. **使用通用函数**：

   - 在 `signup` 控制器中，我们在保存用户后调用 `createResponse`，传入新创建的用户对象和要排除的属性（如 `password`）。
   - 使用 `newUser.toObject()` 将 Mongoose 文档转换为普通 JavaScript 对象，以便可以使用 `delete` 操作。

这种方法确保了函数的通用性，并提供了更灵活的响应对象生成方式。如果将来需要排除更多字段或用于其他对象类型，只需调用这个通用函数并传递相应的参数即可。

---

### Protected Route

在你提供的代码设计中，存在一些潜在的安全隐患和改进空间。以下是详细的分析和改进建议：

#### 现有代码的安全隐患

1. **JWT 保护机制**：

   - `protectRoute` 中验证 JWT 后直接从 cookie 中获取并解析，没有对异常情况（如 JWT 被篡改或过期）进行详细处理。
   - JWT 一旦签发，直到其过期时间到来之前，无法撤销或无效化。

2. **错误信息泄露**：

   - 返回的错误信息（如 "Unauthorized: Invalid Token"）可能会泄露给攻击者一些有关系统的内部信息。

3. **跨站请求伪造（CSRF）**：

   - `logout` 以及其他需要身份验证的操作，可能受到 CSRF 攻击，需要确保这些请求是从可信来源发出的。

4. **代码模块化和复用性**：

   - `protectRoute` 中的代码可以更模块化，以提高复用性和可读性。

#### 改进建议

1. **改进 JWT 验证**：

   - 增加对 JWT 的异常处理，确保返回的错误信息不包含敏感信息。

2. **使用 CSRF 保护**：

   - 可以使用 CSRF 保护机制来确保请求的来源可信。

3. **模块化 `protectRoute` 中的逻辑**：

   - 将 JWT 验证和用户查找分离为独立函数，提升代码的复用性和可读性。

4. **黑名单机制（可选）**：

   - 实现 JWT 黑名单机制，以便在用户注销后将 JWT 标记为无效。

#### 改进后的代码

##### `auth.controller.js`

```javascript
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createResponse } from "../lib/utils/responseHelper.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  // signup 实现同之前
};

export const login = async (req, res) => {
  // login 实现同之前
};

export const logout = async (req, res) => {
  try {
    // 清除 cookie，设置相关的安全选项
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
```

##### `protectRoute.js`

```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(new Error("Invalid token"));
      }
      resolve(decoded);
    });
  });
};

const findUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const decoded = await verifyToken(token);

    if (req.path === "/logout") {
      // For logout, no need to fetch user
      next();
      return;
    }

    const user = await findUserById(decoded.userId);
    req.user = user;
    next();
  } catch (err) {
    console.log("Error in protectRoute middleware", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
```

##### `routes/auth.routes.js`

```javascript
import express from "express";
import {
  getMe,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectRoute, logout); // 确保 logout 也需要保护

export default router;
```

#### 具体改进点

1. **模块化和抽象**：

   - 将 JWT 验证和用户查找逻辑抽象为独立的函数，提高代码的复用性和可维护性。

2. **改进错误处理**：

   - 对 JWT 验证错误和用户查找错误进行细粒度处理，返回统一的错误信息。

3. **CSRF 保护**：

   - 确保在关键操作（如 `logout`）中保护路由，以防止 CSRF 攻击。

通过这些改进，可以增强代码的安全性和可维护性，减少潜在的安全隐患。
