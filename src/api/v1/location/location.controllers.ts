import { Request, Response } from "express";
import { errorService, locationService } from "../../../services";
import { configureLocationQuery } from "../../../helpers";
import { EErrorTypes, IModifiedRequest } from "../../../types";
import { refreshLocationDatabase } from "../../../jobs";

export async function getLocations(req: IModifiedRequest, res: Response) {
    try {
        const { text } = configureLocationQuery(req.query as any);
        const locations = await locationService.findLocationsByText(text);

        if (!locations) {
            errorService.throwError(
                EErrorTypes.DOCUMENT_NOT_FOUND,
                "Locations not found"
            );
        }

        res.json({
            message: "Locations successfully fetched",
            data: locations,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function refreshDatabase(req: IModifiedRequest, res: Response) {
    try {
        await refreshLocationDatabase(req.body);

        res.json({
            message: "Locations successfully fetched",
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}
