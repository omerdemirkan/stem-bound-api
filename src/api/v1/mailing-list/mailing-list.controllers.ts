import { Request, Response } from "express";
import { mailingListService, errorService } from "../../../services";
import { IModifiedRequest } from "../../../types";

export async function createMailingListSubscriber(
    req: IModifiedRequest,
    res: Response
) {
    try {
        let { email, a, affiliate, role } = req.body;
        let subscriber: any = { email };

        affiliate = affiliate || a;
        if (affiliate) {
            subscriber.affiliate = affiliate;
        }
        const mailingListSubscriber = await mailingListService.createSubscriber(
            { email, affiliate, role }
        );

        res.json({
            message: "Successfully subscribed to mailing list!",
            data: mailingListSubscriber,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function getMailingListSubscribers(
    req: IModifiedRequest,
    res: Response
) {
    try {
        const mailingListSubscribers = await mailingListService.findSubscribers();

        res.json({
            message: "Successfully fetched mailing list subscribers",
            data: mailingListSubscribers,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}
