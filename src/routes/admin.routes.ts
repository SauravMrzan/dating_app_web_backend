import { Router } from "express";
import multer from "multer";
import { isAdmin, protect } from "../middleware/admin.middleware";
import { AdminController } from "../controllers/admin.controller";

const router = Router();
const adminController = new AdminController();

// Multer setup for Admin to handle profile pictures
const upload = multer({ dest: 'uploads/' });

/** * ACTIVITY-BASED LEARNING: 
 * Notice how every route below has 'protect' and 'isAdmin'.
 * This fulfills your task: "Only admin role can access the above mentioned api endpoints."
 */

// 1. GET /api/admin/users -> List all users
router.get("/users", protect, isAdmin, (req, res) => adminController.getAllUsers(req, res));

// 2. POST /api/admin/users -> Create user with Image (Uses Multer)
router.post("/users", protect, isAdmin, upload.single('profilePicture'), (req, res) => adminController.createUser(req, res));

// 3. GET /api/admin/users/:id -> Get specific user details
router.get('/users/:id', protect, isAdmin, (req, res) => adminController.getUserById(req, res));

// 4. PUT /api/admin/users/:id -> Update user with optional Image
router.put("/users/:id", protect, isAdmin, upload.single('profilePicture'), (req, res) => adminController.updateUser(req, res));

// 5. DELETE /api/admin/users/:id -> Remove a user
router.delete("/users/:id", protect, isAdmin, (req, res) => adminController.deleteUser(req, res));

// Dashboard stats for the dummy frontend table/cards
router.get('/dashboard-stats', protect, isAdmin, (req, res) => adminController.getDashboardStats(req, res));

export default router;