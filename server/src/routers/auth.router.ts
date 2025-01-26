import { Router } from 'express';
import { loginCtrl } from '../controllers/auth.ctrl';

const router = Router();

router.post('/login', loginCtrl);

export default router;
