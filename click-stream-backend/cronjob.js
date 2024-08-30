import { schedule } from "node-cron";
import DB from "./db.js";
import { logger } from "./utils/logger.js";
import { publishKafkaMessage } from "./kafka.js";
import { CART_TOPIC } from "./utils/constants.js";

const db = DB.getConnection();

export const resetCartStatus = () => {
  schedule("* * * * *", async () => {
    try {
      logger.info(
        "Running cron job - checking checkout status expiry within 3 minutes"
      );

      // 1. Fetch carts that have been in 'CHECKOUT' status for over 3 minutes
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() - 3); // 3 minutes ago
      const formattedDate = expirationTime
        .toUTCString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(",", "");
      logger.info(`"expiration date ${formattedDate}"`);

      const query =
        'SELECT ID, USER_ID FROM cart WHERE status = "CHECKOUT" AND updated_date < ?';
      db.all(query, [formattedDate], async (err, rows) => {
        if (err) {
          logger.error("Database error while fetching expired carts", err);
          return;
        }

        const cartIdsToUpdate = rows.map((row) => row.ID);

        // 2. Update the status of these carts back to 'ACTIVE'
        if (cartIdsToUpdate.length > 0) {
          const updateQuery = "UPDATE cart SET status = ? WHERE ID IN (?)";

          logger.info(updateQuery);

          db.run(
            updateQuery,
            ["ACTIVE", cartIdsToUpdate.join(",")],
            function (err) {
              if (err) {
                logger.error(
                  "Database error while updating cart status ::: ",
                  err
                );
                return;
              }

              rows.forEach((row) => {
                const event = {
                  key: row.user_id,
                  message: {
                    cartId: row.ID,
                    type: "CHECKOUT_EXPIRED",
                    detail: "Reset cart status to active after checkout",
                  },
                };

                publishKafkaMessage(CART_TOPIC, event).catch((err) =>
                  logger.error(err)
                );
              });

              logger.info(
                `Updated ${this.changes} carts back to ACTIVE status`
              );
            }
          );
        }
      });
    } catch (err) {
      logger.error("Error in cron job:", err);
    }
  });
};
