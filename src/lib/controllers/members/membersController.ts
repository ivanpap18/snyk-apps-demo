import type { Controller } from '../../types';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import {getMembersFromApi} from './membersHandlers';

/**
 * The MembersController class for handling memers
 * page and related requests. Every controller class
 * implements the controller interface which
 * has two members the path and the router.
 */
export class MembersController implements Controller {
  // The base URL path for this controller
  public path = '/members';
  // Express router for this controller
  public router: Router = Router();

  /**
   * The constructor is used to initialize the
   * routes for this controller
   */
  constructor() {
    this.initRoutes();
  }
  
  private initRoutes() {
    // The route to render all members lists
    this.router.get(`${this.path}`, this.getMembers);
  }
  
  /**
   * Gets the members page from the Snyk API using the
   * user access token and then renders the members list
   * @returns Members page with list of members
   * otherwise error via next function for error
   * middleware to handle
  */
 private async getMembers(req: Request, res: Response, next: NextFunction) {
   try {
     const members = await getMembersFromApi();
     return res.render('members', {
      members,
      });
    } catch (error) {
      return next(error);
    }
  }
}
