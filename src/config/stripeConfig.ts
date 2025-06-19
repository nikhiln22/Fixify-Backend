import Stripe from "stripe";
import config from "./env";

export const stripe = new Stripe(config.STRIPE_SECRET_KEY,{
    apiVersion:'2025-05-28.basil'
})
