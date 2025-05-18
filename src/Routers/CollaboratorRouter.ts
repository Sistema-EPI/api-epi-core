import { Router } from "express";
import RequestHandler from "../Helpers/RequestHandler";
import * as CollaboratorController from '../Controllers/CollaboratorController';

const collaborator = Router();

//v1/collaborator

collaborator.post(
    '/create/:companyId',
    // verifyToken,
    // verifyPermission(['collaborator:create']),
    RequestHandler(CollaboratorController.createCollaborator),
);

export default collaborator;

