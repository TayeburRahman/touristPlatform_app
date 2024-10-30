import { Request, Response, NextFunction } from 'express';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import User from '../modules/auth/auth.model';
import Admin from '../modules/admin/admin.model'; 
import Auth from '../modules/auth/auth.model';
import { ENUM_USER_ROLE } from '../../enums/user';

const auth =
  (...roles: ENUM_USER_ROLE[]  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
 
    try {
      const tokenWithBearer = req.headers.authorization;

      if (!tokenWithBearer) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'You are not authorized for this role'
        );
      }

      if (tokenWithBearer.startsWith('Bearer')) {
        const token = tokenWithBearer.split(' ')[1];

        // Verify token
        const verifyUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);
        // Set user to headers
        req.user = verifyUser; 

        const isExist = await Auth.findById(verifyUser?.authId);  

        if (
          !Object.values(ENUM_USER_ROLE).includes(verifyUser.role) ||
          !isExist
        ) {
          throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
        }

        if (roles.length && !roles.includes(verifyUser.role)) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            'Access Forbidden: You do not have permission to perform this action'
          );
        }
        next();
      }
    } catch (error) {
      next(error);
    }
  };

export default auth;
