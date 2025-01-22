import $ from "jquery";
import { renderLoginScreen } from "./screens/login.screen";
import {connectSocket} from "./utils/socket";

$(document).ready(() => {
    renderLoginScreen();
});