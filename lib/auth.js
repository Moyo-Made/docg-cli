import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const USERS_FILE = path.join(process.cwd(), "users.json");

// Helper function to read users from file
function getUsers() {
	if (!fs.existsSync(USERS_FILE)) {
		return [];
	}
	const data = fs.readFileSync(USERS_FILE, "utf8");
	return JSON.parse(data);
}

// Helper function to write users to file
function saveUsers(users) {
	fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function register(username, password) {
	const users = getUsers();
	if (users.find((u) => u.username === username)) {
		throw new Error("Username already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	users.push({ username, password: hashedPassword });
	saveUsers(users);

	return jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
}

export async function login(username, password) {
	const users = getUsers();
	const user = users.find((u) => u.username === username);
	if (!user) {
		throw new Error("User not found");
	}

	const match = await bcrypt.compare(password, user.password);
	if (!match) {
		throw new Error("Invalid password");
	}

	return jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
}

export function verifyToken(token) {
	try {
		return jwt.verify(token, SECRET_KEY);
	} catch (error) {
		throw new Error("Invalid token");
	}
}
