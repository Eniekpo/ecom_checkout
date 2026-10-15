// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Code2,
  ShoppingBag,
  Building2,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  lookupPostcode,
  calculateShippingRate,
} from "./services/nipostApi";

const SAMPLE_CODES = [
  { code: "LA-11-W06-TC-10", label: "Lagos (Ikeja GRA • Residential)" },
  { code: "FC-01-A01-KP-27", label: "Abuja (NIPOST HQ • Commercial)" },
  { code: "FC-01-A01-LR-01", label: "Abuja (Garki Area 11 • Commercial)" },
  { code: "FC-03-B06-AG-12", label: "Abuja (Bwari/Maitama • Residential)" },
  { code: "OG-14-T18-BN-16", label: "Ogun (Akute Border • Residential)" },
  { code: "EK-01-A03-FK-01", label: "Ekiti (Ado Ekiti • Residential)" },
];

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [postcodeInput, setPostcodeInput] = useState("LA-11-W06-TC-10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [customerName, setCustomerName] = useState("Adebayo Ogunlesi");
  const [customerPhone, setCustomerPhone] = useState("0803 000 1234");
  const [apartmentNote, setApartmentNote] = useState("Flat 2B, Second Floor");

  const cartItems = [
    { id: 1, name: "5G Dual-Band Router (MTN/Airtel Unlocked)", price: 32000, qty: 1 },
    { id: 2, name: "20,000mAh Fast-Charge UPS Power Bank", price: 16500, qty: 1 },
  ];
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  async function handleVerifyPostcode(codeToLookup = postcodeInput) {
    setLoading(true);
    setError("");
    setOrderPlaced(false);

    try {
      const response = await lookupPostcode(codeToLookup, apiKey);
      const quote = calculateShippingRate(response.segments, response.data);
      setLookupResult(response);
      setShippingQuote(quote);
      setPostcodeInput(response.canonical);
    } catch (err) {
      setLookupResult(null);
      setShippingQuote(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Run initial lookup on mount so the demo loads in a verified state
  useEffect(() => {
    handleVerifyPostcode("LA-11-W06-TC-10");
  }, []);

  function handleSelectSample(code) {
    setPostcodeInput(code);
    handleVerifyPostcode(code);
  }

  function handleCopyCanonical() {
    if (!lookupResult) return;
    navigator.clipboard.writeText(lookupResult.canonical);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  }

  function handleSubmitOrder(e) {
    e.preventDefault();
    if (!lookupResult) {
      setError("Please verify a valid NIPOST postcode before completing checkout.");
      return;
    }
    setOrderPlaced(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation & API Key Configuration Header */}
      <header className="bg-emerald-900 text-white border-b border-emerald-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-700 p-2 rounded-lg border border-emerald-600">
              <MapPin className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg leading-tight">
                  NaijaCart Instant Checkout
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-600">
                  Prototype 1 • Commerce & Logistics
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Built on the Official NIPOST National Digital Alphanumeric Postcode API
              </p>
            </div>
          </div>

          {/* Optional Live/Test API Key Input */}
          <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-700">
            <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Optional: X-API-Key (nipost_pk_test_...)"
              className="bg-transparent text-xs text-white placeholder-emerald-400/70 focus:outline-none w-60"
            />
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column: Ecommerce Checkout Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Postcode Verification Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900">
                1. Enter Delivery Building Postcode
              </h2>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Format: AA-99-A99-AA-99
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter any 11-character NIPOST postcode (with hyphens, spaces, or compact) to autofill the verified building address and calculate exact delivery fees.
            </p>

            {/* Quick Sample Buttons for Live Demo */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Click a sample NIPOST postcode to test live routing & pricing:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_CODES.map((sample) => (
                  <button
                    key={sample.code}
                    type="button"
                    onClick={() => handleSelectSample(sample.code)}
                    className={`text-xs px-2.5 py-1.5 rounded-md border font-mono transition text-left ${
                      lookupResult?.canonical === sample.code
                        ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="font-bold">{sample.code}</span>{" "}
                    <span className="font-sans text-[11px] text-slate-500">
                      {sample.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Postcode Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={postcodeInput}
                onChange={(e) => setPostcodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleVerifyPostcode(postcodeInput);
                  }
                }}
                placeholder="e.g. LA-11-W06-TC-10 or FC 01 A01 KP 27"
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => handleVerifyPostcode(postcodeInput)}
                disabled={loading}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify Postcode
                  </>
                )}
              </button>
            </div>

            {/* Validation / API Error Alert */}
            {error && (
              <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-lg text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Postcode Verification Failed</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Verified NIPOST Address Card */}
            {lookupResult && (
              <div className="mt-5 bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Verified NIPOST Building Footprint
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCanonical}
                      className="inline-flex items-center gap-1 text-xs font-mono bg-white hover:bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-emerald-200 transition cursor-pointer"
                      title="Copy Canonical Postcode"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          {lookupResult.canonical}
                        </>
                      )}
                    </button>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 capitalize">
                      <Building2 className="w-3.5 h-3.5" />
                      {lookupResult.data.building_use_status}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-emerald-100">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">
                    Official Registered Building Address (Locked)
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {lookupResult.data.recent_house_address?.recent || "Address Available"}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block text-[11px]">State</span>
                    <span className="font-semibold text-slate-800">
                      {lookupResult.data.administrative_address?.state_name}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block text-[11px]">LGA</span>
                    <span className="font-semibold text-slate-800">
                      {lookupResult.data.administrative_address?.lga_name}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block text-[11px]">Locality</span>
                    <span className="font-semibold text-slate-800">
                      {lookupResult.data.administrative_address?.locality_name}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block text-[11px]">Geopolitical Zone</span>
                    <span className="font-semibold text-slate-800">
                      {lookupResult.data.administrative_address?.zone}
                    </span>
                  </div>
                </div>

                {lookupResult.warning && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded">
                    {lookupResult.warning}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Recipient & Sub-Building Unit Details */}
          <form
            onSubmit={handleSubmitOrder}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900">
                2. Recipient & Sub-Building Unit Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                NIPOST postcodes identify the exact building structure. Since tenants in a multi-unit block or office complex share one building code, specify your flat, floor, or suite below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flat, Floor, Suite, or Department (Shared Building Identifier)
              </label>
              <input
                type="text"
                value={apartmentNote}
                onChange={(e) => setApartmentNote(e.target.value)}
                placeholder="e.g. Flat 2B, Second Floor / Reception Desk"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={!lookupResult}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold py-3 rounded-lg text-sm transition cursor-pointer"
            >
              Complete Verified Order{" "}
              {shippingQuote
                ? `(₦${(cartSubtotal + shippingQuote.totalShipping).toLocaleString()})`
                : ""}
            </button>

            {orderPlaced && lookupResult && shippingQuote && (
              <div className="bg-emerald-900 text-white p-4 rounded-xl text-xs space-y-1.5 border border-emerald-700">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-emerald-200">
                    Dispatch Manifest Ticket Generated!
                  </p>
                  <span className="font-mono bg-emerald-800 px-2 py-0.5 rounded text-emerald-100">
                    {lookupResult.canonical}
                  </span>
                </div>
                <p>
                  <span className="text-emerald-300">Recipient:</span> {customerName} ({customerPhone})
                </p>
                <p>
                  <span className="text-emerald-300">Verified Building:</span>{" "}
                  {lookupResult.data.recent_house_address?.recent} —{" "}
                  <span className="underline">{apartmentNote}</span>
                </p>
                <p>
                  <span className="text-emerald-300">Assigned Hub:</span>{" "}
                  {shippingQuote.dispatchTier} •{" "}
                  <span className="font-semibold">{shippingQuote.estimatedWindow}</span>
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Dynamic Fee Breakdown & Live API Inspector */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order & Delivery Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-900">
                  Order & Segment-Driven Delivery Quote
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Fulfillment: Lagos Hub
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 border-b border-slate-100 pb-3 text-xs">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-slate-700">
                  <span>
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-medium text-slate-900">
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-1 font-semibold text-slate-900">
                <span>Cart Subtotal</span>
                <span>₦{cartSubtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Dynamic Shipping Rate Breakdown */}
            <div className="space-y-2 text-xs text-slate-600">
              {shippingQuote && lookupResult ? (
                <>
                  <div className="flex justify-between">
                    <span>
                      State Base Rate (Segment 1:{" "}
                      <strong className="font-mono text-slate-800">
                        {lookupResult.segments.state}
                      </strong>
                      )
                    </span>
                    <span>₦{shippingQuote.baseFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      LGA & District Surcharge (Seg 2 & 3:{" "}
                      <strong className="font-mono text-slate-800">
                        {lookupResult.segments.lga}-{lookupResult.segments.district}
                      </strong>
                      )
                    </span>
                    <span>+₦{shippingQuote.lgaSurcharge.toLocaleString()}</span>
                  </div>
                  {shippingQuote.handlingAdjustment !== 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Commercial Building Reception Drop-Off Discount</span>
                      <span>
                        -₦{Math.abs(shippingQuote.handlingAdjustment).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-semibold text-emerald-800">
                    <span>Calculated Shipping Fee</span>
                    <span>₦{shippingQuote.totalShipping.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                    <span>Total Amount Payable</span>
                    <span>
                      ₦
                      {(
                        cartSubtotal + shippingQuote.totalShipping
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">
                        {shippingQuote.dispatchTier}
                      </p>
                      <p className="text-slate-500">
                        Estimated arrival: {shippingQuote.estimatedWindow}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 italic py-2">
                  Verify a valid NIPOST postcode to compute automated delivery fees.
                </p>
              )}
            </div>
          </div>

          {/* Live NIPOST API Inspector Panel for Showcase Judges */}
          <div className="bg-slate-900 text-slate-100 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Live NIPOST API Inspector
                </h3>
              </div>
              {lookupResult && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {lookupResult.source === "live_api"
                    ? "Gateway: api.postcode.gov.ng"
                    : "Mode: Sandbox Level 3 Schema"}
                </span>
              )}
            </div>

            {lookupResult ? (
              <div className="space-y-4 text-xs">
                {/* 5-Segment Breakdown */}
                <div>
                  <span className="text-slate-400 block mb-1.5">
                    Disassembled 11-Character Segments ({lookupResult.display}):
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <span className="text-emerald-400 font-bold block text-sm">
                        {lookupResult.segments.state}
                      </span>
                      <span className="text-[10px] text-slate-400">1. State</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <span className="text-emerald-400 font-bold block text-sm">
                        {lookupResult.segments.lga}
                      </span>
                      <span className="text-[10px] text-slate-400">2. LGA</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <span className="text-emerald-400 font-bold block text-sm">
                        {lookupResult.segments.district}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        3. District
                      </span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <span className="text-emerald-400 font-bold block text-sm">
                        {lookupResult.segments.area}
                      </span>
                      <span className="text-[10px] text-slate-400">4. Area</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <span className="text-emerald-400 font-bold block text-sm">
                        {lookupResult.segments.unit}
                      </span>
                      <span className="text-[10px] text-slate-400">5. Unit</span>
                    </div>
                  </div>
                </div>

                {/* Request Endpoint */}
                <div>
                  <span className="text-slate-400 block mb-1">
                    HTTP GET Request Endpoint:
                  </span>
                  <code className="block bg-slate-950 p-2.5 rounded border border-slate-800 text-emerald-300 font-mono text-[11px] break-all">
                    {lookupResult.endpointUrl}
                  </code>
                </div>

                {/* Raw JSON Response */}
                <div>
                  <span className="text-slate-400 block mb-1">
                    NIPOST Level 3 JSON Response (`data`):
                  </span>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(lookupResult.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                Click "Verify Postcode" to inspect the disassembled segments and
                NIPOST API Level 3 JSON payload.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
