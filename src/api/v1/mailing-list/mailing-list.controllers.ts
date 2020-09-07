import { Request, Response } from "express";
import { mailingListService, errorService } from "../../../services";

export async function createMailingListSubscriber(req: Request, res: Response) {
    try {
        let { email, a, affiliate } = req.body;
        let subscriber: any = { email };

        affiliate = affiliate || a;
        if (affiliate) {
            subscriber.affiliate = affiliate;
        }
        const mailingListSubscriber = await mailingListService.createSubscriber(
            { email, affiliate }
        );

        res.json({
            message: "Successfully subscribed to mailing list!",
            data: mailingListSubscriber,
        });
    } catch (e) {
        res.status(errorService.status(e)).json(errorService.json(e));
    }
}

export async function getMailingListSubscribers(req: Request, res: Response) {
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
