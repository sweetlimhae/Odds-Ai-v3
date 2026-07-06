import { Router, type IRouter } from "express";
import healthRouter from "./health";
import oddsRouter from "./odds";

const router: IRouter = Router();

router.use(healthRouter);
router.use(oddsRouter);

export default router;
