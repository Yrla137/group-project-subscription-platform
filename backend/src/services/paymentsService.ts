import { pool } from "../config/db";
import type { Payment, CreatePayment } from '../types/paymentsType';

// GET - get all payments
const getAllPayments = async () : Promise<Payment[]> => {
    const result = await pool.query("SELECT id, user_id, tier_id, amount, payment_date FROM payments");
    return result.rows;
};

// GET - get payment only by id
const getPaymentById = async (id: number) : Promise<Payment | null> => {
    const result = await pool.query("SELECT id, user_id, tier_id, amount, payment_date FROM payments WHERE id = $1", [id]);
    return result.rows[0] || null;
};

// GET - get a user's own payments by user id
const getPaymentsByUserId = async (userId: number) : Promise<Payment[]> => {
    const result = await pool.query("SELECT id, user_id, tier_id, amount, payment_date FROM payments WHERE user_id = $1", [userId]);
    return result.rows;
};

// POST - create a new payment
const createPayment = async (data: CreatePayment, userId: number): Promise<Payment> => {

    const client = await pool.connect();

    try {
        // Start a transaction
        await client.query('BEGIN');

        const userTierResult = await client.query('SELECT current_tier_id FROM users WHERE id = $1', [userId]);
        if (userTierResult.rows.length === 0) {
            throw new Error(`User with id ${userId} not found`);
        }

        if (userTierResult.rows[0].current_tier_id === data.tier_id){
            throw new Error(`User with id ${userId} is already subscribed to tier ${data.tier_id}`);
        }

        // Get the price of the tier
        const tierPriceResult = await client.query('SELECT price FROM tiers WHERE id = $1', [data.tier_id]);
        if (tierPriceResult.rows.length === 0) {
            throw new Error(`Tier with id ${data.tier_id} not found`);
        }

        // Insert the new payment
        const result = await client.query(
            `INSERT INTO payments (user_id, tier_id, amount, payment_date)
             VALUES ($1, $2, $3, NOW())
             RETURNING id, user_id, tier_id, amount, payment_date`,
            [userId, data.tier_id, tierPriceResult.rows[0].price]
        );

        // Update the user's current_tier_id in the users table
        const updatedUserTierResult = await client.query(
            `UPDATE users
             SET current_tier_id = $1
                WHERE id = $2
                RETURNING id, current_tier_id`,
            [data.tier_id, userId]
        );

        if (updatedUserTierResult.rows.length === 0) {
            throw new Error(`User with id ${userId} not found`);
        }

        // Commit the transaction
        await client.query('COMMIT');

        return result.rows[0];
        
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export { getAllPayments, getPaymentById, getPaymentsByUserId, createPayment };