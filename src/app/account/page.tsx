import Link from "next/link";
import { CraftTracker } from "@/components/commerce/craft-tracker";
import { getAdminSession } from "@/lib/admin-auth";
import { adminRepository } from "@/lib/admin-repository";
import { getStorefrontOrderIds } from "@/lib/storefront-access";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ customer?: string | string[] }> }) {
  const { customer } = await searchParams;
  const previewCustomerId = Array.isArray(customer) ? customer[0] : customer;
  const session = await getAdminSession();
  const previewCustomer = session && previewCustomerId ? adminRepository.get("customers", previewCustomerId) : undefined;
  const allowed = new Set(await getStorefrontOrderIds());
  const orders = adminRepository.listOrders().filter(order => previewCustomer ? order.customerId === previewCustomer.id : allowed.has(order.id)).slice(0, 20);
  const invoices = adminRepository.listInvoices();

  return (
    <main className="shell account-page">
      <p className="eyebrow">{previewCustomer ? "Admin storefront preview" : "Your GEMOIREJEWELSLLP account"}</p>
      <h1>{previewCustomer ? `${previewCustomer.name}'s orders` : "Your orders"}</h1>
      {previewCustomer ? <p className="lede">Signed-in admin preview · {previewCustomer.email}</p> : null}
      {orders.length ? (
        <div className="grid gap-5">
          {orders.map(order => {
            const invoice = invoices.find(item => item.orderId === order.id);
            return (
              <section className="account-order" key={order.id}>
                <div>
                  <span className="label">{order.status}</span>
                  <h3>{order.code}</h3>
                  <p>Placed {new Date(order.createdAt).toLocaleDateString("en-AU")} · AUD ${order.totalAud.toLocaleString()}</p>
                </div>
                {invoice ? <Link className="button button-outline button-small" href={`/invoice/${encodeURIComponent(invoice.number)}`}>Invoice</Link> : null}
                <div className="col-span-full mt-4"><CraftTracker current={order.craftStage}/></div>
              </section>
            );
          })}
        </div>
      ) : (
        <p className="lede">{previewCustomer ? "This customer has no orders yet." : "Orders placed in this browser will appear here after checkout."}</p>
      )}
    </main>
  );
}
