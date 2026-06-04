import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to frontend folder
const frontendPath = path.join(__dirname, "frontend");

// Serve static files
app.use(express.static(frontendPath));

// Homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Dynamic routes for pages
app.get("/:page", (req, res) => {
    const page = req.params.page;

    res.sendFile(
        path.join(frontendPath, "pages", `${page}.html`),
        (err) => {
            if (err) {
                res.status(404).send("Page not found");
            }
        }
    );
});

// Parse JSON requests
app.use(express.json());

// Register API
app.post("/api/auth/register", (req, res) => {
    const { fullName, email, password, level } = req.body;

    console.log("New User:");
    console.log(fullName, email, password, level);

    // Fake success response
    res.status(200).json({
        success: true,
        message: "Registration successful"
    });
});

// LOGIN ROUTE
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt:", email, password);

    // Fake login check
    if (
        email === "tester07.089@gmail.com" &&
        password === "password123"
    ) {
        res.json({
            success: true,
            message: "Login successful"
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});