"use client";

import axios from "axios";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import useCart from "@/hooks/use-cart";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";



function loadScript(src) {
	return new Promise((resolve) => {
		const script = document.createElement('script')
		script.src = src
		script.onload = () => {
			resolve(true)
		}
		script.onerror = () => {
			resolve(false)
		}
		document.body.appendChild(script)
	})
}



const Summary = () => {
	const searchParams = useSearchParams();
	const items = useCart((state) => state.items);
	const removeAll = useCart((state) => state.removeAll);

	useEffect(() => {
		if (searchParams.get("success")) {
			toast.success("Payment completed.");
			removeAll();
		}

		if (searchParams.get("canceled")) {
			toast.error("Something went wrong.");
		}
	}, [searchParams, removeAll]);

	const totalPrice = items.reduce((total, item) => {
		return total + Number(item.price);
	}, 0);

	const onCheckout = async () => {
		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}/checkout`,
			{
				productIds: items.map((item) => item.id),
			}
		);

		const orders = response.data.products;
		let totalPayment = 0
		orders.forEach((i: { price: string; }) => {
			totalPayment += parseInt(i.price)

		});

		const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

		if (!res) {
			alert('Razropay failed to load!!')
			return
		}

		var options = {
			key: "SECRET_KEY",
			amount: totalPayment * 100, // amount in paise (change accordingly)
			currency: "INR",
			name: "Acme Corp",
			description: "Test Payment",
			image: "https://example.com/your_logo.png",
			handler: function (response) {
				alert("Payment Successful!");
				console.log(response);
				window.location.href = "/";
			},
		};

		const paymentObject = new window.Razorpay(options);
		paymentObject.open();
	}

	return (
		<div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
			<h2 className="text-lg font-medium text-gray-900">Order summary</h2>
			<div className="mt-6 space-y-4">
				<div className="flex items-center justify-between border-t border-gray-200 pt-4">
					<div className="text-base font-medium text-gray-900">
						Order total
					</div>
					<Currency value={totalPrice} />
				</div>
			</div>
			<Button
				onClick={onCheckout}
				disabled={items.length === 0}
				className="w-full mt-6"
			>
				Checkout
			</Button>
		</div>
	);
};

export default Summary;
