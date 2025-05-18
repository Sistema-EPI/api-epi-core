import { Router } from "express";
import RequestHandler from "../Helpers/RequestHandler";
import * as CollaboratorController from '../Controllers/CollaboratorController';

const collaborator = Router();

//v1/collaborator

collaborator.get(
    '/get/all',
    // verifyToken,
    // verifyPermission(['collaborator:read']),
    RequestHandler(CollaboratorController.getAllCollaborators),
);

collaborator.get(
    '/get/:id',
    // verifyToken,
    // verifyPermission(['collaborator:read']),
    RequestHandler(CollaboratorController.getCollaboratorById),
)

collaborator.post(
    '/create/:companyId',
    // verifyToken,
    // verifyPermission(['collaborator:create']),
    RequestHandler(CollaboratorController.createCollaborator),
);

collaborator.put(
    '/update/:id',
    // verifyToken,
    // verifyPermission(['collaborator:update']),
    RequestHandler(CollaboratorController.updateCollaborator),
)

collaborator.delete(
    '/delete/:id',
    // verifyToken,
    // verifyPermission(['companies:delete']),
    RequestHandler(CollaboratorController.deleteCollaborator),
)

export default collaborator;

