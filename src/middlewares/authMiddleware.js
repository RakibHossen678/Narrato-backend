const AppError = require("../errors/AppError");
const { verifyToken } = require("../helper/utils/tokenUtils");
const { StatusCodes } = require("http-status-codes");

const authMiddleware = (...requiredRoles) => {
	return (req, res, next) => {
		const token = req.headers.authorization;
		if (!token) {
			return next(
				new AppError(
					StatusCodes.UNAUTHORIZED,
					"No token provided",
					"Authentication token is required to access this resource."
				)
			);
		}

		const tokenParts = token.split(" ");
		if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
			return next(
				new AppError(
					StatusCodes.UNAUTHORIZED,
					"Invalid token format",
					"The authentication token format is incorrect. Expected format: 'Bearer <token>'."
				)
			);
		}

		const decoded = verifyToken(tokenParts[1]);

		if (!decoded) {
			return next(
				new AppError(
					StatusCodes.UNAUTHORIZED,
					"Failed to authenticate token",
					"The provided token is invalid or has expired. Please log in again."
				)
			);
		}

		// Check roles only if requiredRoles are specified
		if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
			return next(
				new AppError(
					StatusCodes.FORBIDDEN,
					"Access denied. Insufficient permissions.",
					"You do not have the necessary permissions to access this resource."
				)
			);
		}

		req.user = decoded;
		next();
	};
};

module.exports = authMiddleware;
