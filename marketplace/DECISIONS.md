# API decisions

- API resources, form requests, and controllers live under `app/Http/Resources`, `app/Http/Requests`, and `app/Http/Controllers/Api`.
- The brief mentions JWT with Sanctum. Sanctum personal access tokens are opaque bearer tokens, not JWTs. This API uses Sanctum's token format and revocation model.
- All order creation and cancellation work is enclosed in database transactions. Product rows are locked with `SELECT ... FOR UPDATE` in ascending ID order before checking stock. Concurrent orders for the same product wait for that lock, then read the committed stock, so stock cannot become negative. Cancellation locks the order and product rows before restoring stock.
- The customer row is locked before checking pending orders. Requests for the same customer serialize while enforcing the three pending order limit.
- Maximum quantity is 5 per item; client supplied prices and totals are ignored. Variants are descriptive values on products and remain independently purchasable by product ID.
- Seed admin login: `admin@example.com` / `password` (change the password for any deployed environment).
