# Antigravity IDE Project Blueprint: Prototype 1 — Ecommerce Checkout & Delivery Fee Calculator

> **How to use this file in Antigravity IDE:**
> Drop this file into your workspace root or paste its contents directly into the Antigravity IDE Agent prompt window. Tell the agent: *"Execute the specification in this blueprint to scaffold, configure, and run the complete `nipost-checkout-demo` React + Vite + Tailwind application."*

---

## 1. Master Prompt for Antigravity IDE Agent

**Role & Objective:**
You are building **NaijaCart Instant Checkout**, a working prototype for the **Build on Nigeria's Postcode** live showcase organized by the Federal Ministry of Communications, Innovation and Digital Economy, NIPOST, and 3MTT Nigeria (`pitch.postcode.gov.ng`, First Session: Tuesday, October 27, 2026).

**Core Goal:**
Create a production-grade React + Vite + Tailwind CSS web application that integrates with the official **NIPOST Postcode API (`https://api.postcode.gov.ng/v1`)** to solve address inaccuracy and manual delivery fee negotiation in Nigerian ecommerce.

**Strict Requirements for the Agent:**
1. Scaffold a React + Vite project using Tailwind CSS and `lucide-react`.
2. Implement the complete NIPOST 11-character alphanumeric postcode parser, validator, and normalizer (`AA-99-A99-AA-99`), enforcing the rule that numeric segments (`LGA` and `Unit`) range from `01` to `99` and never use `00`.
3. Implement the `GET /v1/lookup?code={POSTCODE}&level=3` service with `X-API-Key` header support (`nipost_pk_test_...` / `nipost_test_...`) and a deterministic offline sandbox fallback containing all official NIPOST test and sample postcodes so the live demo never fails.
4. Build the **Dynamic Delivery Fee Calculator** that reads the disassembled segments (`State`, `LGA`, `District`, `Area`, `Unit`) and the API's `building_use_status` (`residential` vs. `commercial`) to compute real-time shipping rates and dispatch routing tiers.
5. Build a dual-pane UI:
   - **Left Pane:** Customer Ecommerce Checkout with 1-click sample postcode pills, live input normalization, verified NIPOST address card, multi-tenant flat/suite input, and order confirmation receipt.
   - **Right Pane:** Dynamic Order & Shipping Quote breakdown + a **Live NIPOST API Inspector** for showcase judges that visualizes the 5 disassembled code segments, the exact HTTP `GET` request URL, and the raw Level 3 JSON payload.

---

## 2. Project Context & Problem Statement

### The Problem (Commerce & Logistics Sector)
Online shoppers in Nigeria enter inconsistent, unstandardized street addresses and informal landmarks at checkout. As a result:
- Merchants and dispatch hubs have to call buyers to ask for directions.
- Delivery pricing is guessed or negotiated manually over WhatsApp or phone calls.
- Riders lose hours navigating ambiguous streets.

### The Solution
When a buyer enters their 11-character NIPOST building postcode at checkout (with or without hyphens or spaces):
1. **Input Normalization & Validation:** The app formats the input into NIPOST's canonical format (`AA-99-A99-AA-99`) and validates every segment client-side before making network calls.
2. **Instant Address Autofill:** Queries `GET https://api.postcode.gov.ng/v1/lookup?code={POSTCODE}&level=3` to auto-populate the verified street address, State, Local Government Area (LGA), Locality, Geopolitical Zone, and Building Use Status (`residential` or `commercial`).
3. **Multi-Tenant Support:** Because NIPOST assigns one postcode per addressable building (meaning all flats or offices inside one structure share the same 11-character code), the checkout locks the verified building address and prompts the buyer only for their specific Flat, Floor, or Suite number.
4. **Segment-Driven Shipping Calculation:** The checkout reads the `State`, `LGA`, and `District` segments alongside `building_use_status` to compute the exact delivery cost, dispatch hub route, and estimated delivery window automatically.

---

## 3. Official NIPOST Postcode & API Technical Specification

### 3.1 Structure of the 11-Character Alphanumeric Postcode
Every NIPOST postcode consists of 11 alphanumeric characters divided into 5 segments (`AA-99-A99-AA-99`):

| Segment Order | Segment Name | Length & Format | Valid Range / Rules | Example (`FC-01-A01-KP-27`) | What It Identifies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Segment 1** | `state` | 2 Letters (`AA`) | `A-Z` (36 States + `FC` for FCT) | `FC` | State or Federal Capital Territory |
| **Segment 2** | `lga` | 2 Digits (`99`) | `01` to `99` (**Never `00`**) | `01` | Local Government Area within the State |
| **Segment 3** | `district` | 3 Alphanumeric (`A99`) | 1 Letter + 2 Digits (or 3 chars) | `A01` | Postal District within the LGA |
| **Segment 4** | `area` | 2 Letters (`AA`) | `A-Z` | `KP` | Specific Neighborhood / Zone inside the District |
| **Segment 5** | `unit` | 2 Digits (`99`) | `01` to `99` (**Never `00`**) | `27` | Individual addressable building |

- **Canonical Format:** `FC-01-A01-KP-27`
- **Display Format:** `FC 01 A01 KP 27`
- **Compact Format:** `FC01A01KP27`
- **Validation Regex:** `^([A-Z]{2})-(0[1-9]|[1-9][0-9])-([A-Z0-9]{3})-([A-Z]{2})-(0[1-9]|[1-9][0-9])$`

### 3.2 API Endpoints & Authentication
- **Base URL:** `https://api.postcode.gov.ng/v1`
- **Primary Lookup Endpoint:** `GET /v1/lookup?code={POSTCODE}&level=3`
- **Search Autocomplete Endpoint:** `GET /v1/search/autocomplete?q={QUERY}`
- **Authentication Header:**
  ```http
  X-API-Key: nipost_pk_test_xxxxxxxxxxxxxxxxx
  Accept: application/json
  ```
- **Expected Level 3 JSON Response Structure:**
  ```json
  {
    "status": "success",
    "data": {
      "postcode": "FC-01-A01-KP-27",
      "valid": true,
      "administrative_address": {
        "state_name": "FCT",
        "lga_name": "ABUJA MUNICIPAL AREA COUNCIL",
        "locality_name": "CENTRAL BUSINESS DISTRICT",
        "zone": "NORTH CENTRAL"
      },
      "recent_house_address": {
        "recent": "NIPOST HEADQUARTERS, HERBERT MACAULAY WAY, GARKI, ABUJA"
      },
      "building_use_status": "commercial"
    }
  }
  ```

### 3.3 Official Sandbox & Production Sample Postcodes
Include all 9 of these codes in the fallback/sandbox dataset so they work out-of-the-box:
1. `FC-01-A01-KP-27` — NIPOST Headquarters, Herbert Macaulay Way, Garki, Abuja (`commercial`)
2. `FC-01-A01-LR-01` — Plot 42 Tafawa Balewa Way, Area 11, Garki, Abuja (`commercial`)
3. `FC-01-A01-MH-01` — Block 7, Area 3 Residential Quarters, Garki, Abuja (`residential`)
4. `FC-01-A01-MV-01` — Suite Complex, Samuel Ladoke Akintola Blvd, Garki II, Abuja (`commercial`)
5. `FC-01-A01-MW-01` — 19 Gimbiya Street, Area 11, Garki, Abuja (`residential`)
6. `FC-03-B06-AG-12` — 12 Danube Street, Maitama, Bwari / AMAC Boundary, Abuja (`residential`)
7. `LA-11-W06-TC-10` — 14 Isaac John Street, Ikeja GRA, Lagos (`residential`)
8. `EK-01-A03-FK-01` — NTA Road, Back of Fabian Hotel, Ado Ekiti, Ekiti (`residential`)
9. `OG-14-T18-BN-16` — 22 Alagbole Akute Road, Ifo, Ogun State (`residential`)

---

## 4. Dynamic Delivery Fee Calculation Formula

Assuming a fulfillment warehouse in **Lagos**, the shipping fee $F_{\text{total}}$ is computed from the disassembled segments:

$$F_{\text{total}} = F_{\text{base}}(\text{State}, \text{Zone}) + S_{\text{LGA}}(\text{LGA}) + A_{\text{building}}(\text{building\_use\_status})$$

Where:
- **State Base Rate ($F_{\text{base}}$):**
  - `LA` (Lagos Intra-State): $1800\text{ NGN}$ — *Same Day (3 to 5 hours)*
  - `OG` (Ogun Border Metro): $2800\text{ NGN}$ — *Next Day (24 hours)*
  - `EK` or `SOUTH WEST` Zone: $3500\text{ NGN}$ — *1 to 2 Business Days*
  - `FC` (Abuja Air Cargo): $4500\text{ NGN}$ — *Next Day Air Cargo (24 hours)*
  - All other States/Zones: $5200\text{ NGN}$ — *2 to 3 Business Days*
- **LGA Distance Tier Surcharge ($S_{\text{LGA}}$):**
  - In `LA`: $+300\text{ NGN}$ if $\text{LGA} \le 15$, else $+700\text{ NGN}$
  - In `OG`: $+500\text{ NGN}$
  - In `FC`: $+400\text{ NGN}$ if $\text{LGA} = 01$ (AMAC Core), else $+900\text{ NGN}$
  - In `SOUTH WEST`: $+600\text{ NGN}$
  - Other Zones: $+800\text{ NGN}$
- **Building Use Handling Adjustment ($A_{\text{building}}$):**
  - `commercial`: $-200\text{ NGN}$ discount (structured reception/security desk drop-off reduces rider wait time)
  - `residential`: $0\text{ NGN}$

---

## 5. Project Directory Structure

```text
nipost-checkout-demo/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    └── services/
        └── nipostApi.js
```

---

## 6. Complete Implementation Code

### 6.1 `package.json`
```json
{
  "name": "nipost-checkout-demo",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.454.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  }
}
```

### 6.2 `vite.config.js`
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

### 6.3 `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 6.4 `postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 6.5 `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NaijaCart Instant Checkout | NIPOST Postcode API Showcase</title>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 6.6 `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 6.7 `src/main.jsx`
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 6.8 `src/services/nipostApi.js`
```javascript
// src/services/nipostApi.js

const BASE_URL = "https://api.postcode.gov.ng/v1";

/**
 * Official NIPOST Sandbox & Sample Dataset matching docs.postcode.gov.ng Level 3 schema.
 * Ensures 100% reliability during live demos and offline testing.
 */
export const FALLBACK_POSTCODES = {
  "LA-11-W06-TC-10": {
    postcode: "LA-11-W06-TC-10",
    valid: true,
    administrative_address: {
      state_name: "LAGOS",
      lga_name: "IKEJA",
      locality_name: "IKEJA GRA",
      zone: "SOUTH WEST",
    },
    recent_house_address: {
      recent: "14 ISAAC JOHN STREET, IKEJA GRA, LAGOS",
    },
    building_use_status: "residential",
  },
  "FC-01-A01-KP-27": {
    postcode: "FC-01-A01-KP-27",
    valid: true,
    administrative_address: {
      state_name: "FCT",
      lga_name: "ABUJA MUNICIPAL AREA COUNCIL",
      locality_name: "CENTRAL BUSINESS DISTRICT",
      zone: "NORTH CENTRAL",
    },
    recent_house_address: {
      recent: "NIPOST HEADQUARTERS, HERBERT MACAULAY WAY, GARKI, ABUJA",
    },
    building_use_status: "commercial",
  },
  "FC-01-A01-LR-01": {
    postcode: "FC-01-A01-LR-01",
    valid: true,
    administrative_address: {
      state_name: "FCT",
      lga_name: "ABUJA MUNICIPAL AREA COUNCIL",
      locality_name: "GARKI",
      zone: "NORTH CENTRAL",
    },
    recent_house_address: {
      recent: "PLOT 42 TAFAWA BALEWA WAY, AREA 11, GARKI, ABUJA",
    },
    building_use_status: "commercial",
  },
  "FC-01-A01-MH-01": {
    postcode: "FC-01-A01-MH-01",
    valid: true,
    administrative_address: {
      state_name: "FCT",
      lga_name: "ABUJA MUNICIPAL AREA COUNCIL",
      locality_name: "GARKI",
      zone: "NORTH CENTRAL",
    },
    recent_house_address: {
      recent: "BLOCK 7, AREA 3 RESIDENTIAL QUARTERS, GARKI, ABUJA",
    },
    building_use_status: "residential",
  },
  "FC-01-A01-MV-01": {
    postcode: "FC-01-A01-MV-01",
    valid: true,
    administrative_address: {
      state_name: "FCT",
      lga_name: "ABUJA MUNICIPAL AREA COUNCIL",
      locality_name: "GARKI II",
      zone: "NORTH CENTRAL",
    },
    recent_house_address: {
      recent: "SUITE COMPLEX, SAMUEL LADOKE AKINTOLA BLVD, GARKI II, ABUJA",
    },
    building_use_status: "commercial",
  },
  "FC-01-A01-MW-01": {
    postcode: "FC-01-A01-MW-01",
    valid: true,
    administrative_address: {
      state_name: "FCT",
      lga_name: "ABUJA MUNICIPAL AREA COUNCIL",
      locality_name: "GARKI",
      zone: "NORTH CENTRAL",
    },
    recent_house_address: {
      recent: "19 GIMBIYA STREET, AREA 11, GARKI, ABUJA",
    },
    building_use_status: "residential",
  },
  "FC-03-B06-AG-12": {
    postcode: "FC-03-B06-AG-12",
    valid: true,
    administrative_address: {
      state_name: "FCT",
      lga_name: "BWARI",
      locality_name: "MPAPE / MAITAMA EXTENSION",
      zone: "NORTH CENTRAL",
    },
    recent_house_address: {
      recent: "12 DANUBE EXTENSION, MAITAMA HILL BORDER, ABUJA",
    },
    building_use_status: "residential",
  },
  "OG-14-T18-BN-16": {
    postcode: "OG-14-T18-BN-16",
    valid: true,
    administrative_address: {
      state_name: "OGUN",
      lga_name: "IFO",
      locality_name: "AKUTE",
      zone: "SOUTH WEST",
    },
    recent_house_address: {
      recent: "22 ALAGBOLE AKUTE ROAD, IFO, OGUN STATE",
    },
    building_use_status: "residential",
  },
  "EK-01-A03-FK-01": {
    postcode: "EK-01-A03-FK-01",
    valid: true,
    administrative_address: {
      state_name: "EKITI",
      lga_name: "ADO EKITI",
      locality_name: "ADO EKITI",
      zone: "SOUTH WEST",
    },
    recent_house_address: {
      recent: "NTA ROAD, BACK OF FABIAN HOTEL, ADO EKITI",
    },
    building_use_status: "residential",
  },
};

/**
 * Normalizes raw user input (e.g. "fc01a01kp27" or "FC 01 A01 KP 27")
 * into canonical NIPOST format: "FC-01-A01-KP-27"
 */
export function normalizePostcode(rawInput) {
  if (!rawInput) return "";
  const clean = rawInput.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length !== 11) {
    return clean;
  }
  return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 7)}-${clean.slice(7, 9)}-${clean.slice(9, 11)}`;
}

/**
 * Validates and disassembles a canonical postcode into its 5 official segments.
 * Numeric segments (LGA and Unit) must be 01 to 99 and never 00.
 */
export function disassemblePostcode(code) {
  const canonical = normalizePostcode(code);
  const pattern = /^([A-Z]{2})-(0[1-9]|[1-9][0-9])-([A-Z0-9]{3})-([A-Z]{2})-(0[1-9]|[1-9][0-9])$/;
  const match = canonical.match(pattern);

  if (!match) {
    return null;
  }

  return {
    canonical,
    display: canonical.replace(/-/g, " "),
    compact: canonical.replace(/-/g, ""),
    segments: {
      state: match[1],
      lga: match[2],
      district: match[3],
      area: match[4],
      unit: match[5],
    },
  };
}

/**
 * Queries the official NIPOST Postcode API (/v1/lookup) at Level 3.
 * Automatically falls back to the sandbox schema if no API key is entered
 * or if CORS/network issues occur during a live presentation.
 */
export async function lookupPostcode(rawCode, apiKey = "") {
  const disassembled = disassemblePostcode(rawCode);

  if (!disassembled) {
    throw new Error(
      "Invalid NIPOST postcode format. Expected 11 characters (e.g., FC-01-A01-KP-27) where numeric segments (LGA and Building Unit) are between 01 and 99 (never 00)."
    );
  }

  const { canonical, display, compact, segments } = disassembled;
  const endpointUrl = `${BASE_URL}/lookup?code=${encodeURIComponent(canonical)}&level=3`;

  // Attempt live call to api.postcode.gov.ng when an API key is provided
  if (apiKey && apiKey.trim() !== "") {
    try {
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "X-API-Key": apiKey.trim(),
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg =
          result?.error?.message ||
          result?.message ||
          `NIPOST Gateway Error (${response.status})`;
        throw new Error(errorMsg);
      }

      return {
        source: "live_api",
        endpointUrl,
        canonical,
        display,
        compact,
        segments,
        data: result.data || result,
      };
    } catch (networkErr) {
      // If a network/CORS error occurs during a live demo and code exists in fallback, degrade gracefully
      if (FALLBACK_POSTCODES[canonical]) {
        return {
          source: "sandbox_fallback_after_network_err",
          endpointUrl,
          canonical,
          display,
          compact,
          segments,
          data: FALLBACK_POSTCODES[canonical],
          warning: `Live request encountered (${networkErr.message}); resolved using local NIPOST Level 3 cache.`,
        };
      }
      throw networkErr;
    }
  }

  // Simulated latency for realistic UX in sandbox mode
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (FALLBACK_POSTCODES[canonical]) {
    return {
      source: "sandbox_fallback",
      endpointUrl,
      canonical,
      display,
      compact,
      segments,
      data: FALLBACK_POSTCODES[canonical],
    };
  }

  throw new Error(
    `Postcode ${canonical} is valid in format, but is not in the offline sample dataset. Click one of the sample postcodes above or enter your NIPOST X-API-Key in the header.`
  );
}

/**
 * Calculates shipping fee, dispatch hub tier, and delivery window from a Lagos fulfillment center
 * using the disassembled postcode segments and building use status.
 */
export function calculateShippingRate(segments, addressData) {
  const { state, lga, district, area } = segments;
  const buildingType = addressData?.building_use_status || "residential";
  const zone = addressData?.administrative_address?.zone || "SOUTH WEST";

  let baseFee = 2000;
  let lgaSurcharge = 0;
  let estimatedWindow = "Same Day (4 to 6 hours)";
  let dispatchTier = "Lagos Metro Express";

  if (state === "LA") {
    baseFee = 1800;
    lgaSurcharge = parseInt(lga, 10) > 15 ? 700 : 300;
    estimatedWindow = "Same Day (3 to 5 hours)";
    dispatchTier = `Lagos Hub • District ${district} (Area ${area})`;
  } else if (state === "OG") {
    baseFee = 2800;
    lgaSurcharge = 500;
    estimatedWindow = "Next Day (24 hours)";
    dispatchTier = `Greater Lagos Border Route • District ${district}`;
  } else if (state === "FC") {
    baseFee = 4500;
    lgaSurcharge = lga === "01" ? 400 : 900;
    estimatedWindow = "Next Day Air Cargo (24 hours)";
    dispatchTier = `Abuja Cargo Hub • District ${district} (Area ${area})`;
  } else if (zone === "SOUTH WEST") {
    baseFee = 3500;
    lgaSurcharge = 600;
    estimatedWindow = "1 to 2 Business Days";
    dispatchTier = `South West Regional Line • District ${district}`;
  } else {
    baseFee = 5200;
    lgaSurcharge = 800;
    estimatedWindow = "2 to 3 Business Days";
    dispatchTier = `National Inter-State Line • District ${district}`;
  }

  // Commercial buildings have reception desks and faster rider drop-off times
  const handlingAdjustment = buildingType === "commercial" ? -200 : 0;
  const totalShipping = baseFee + lgaSurcharge + handlingAdjustment;

  return {
    baseFee,
    lgaSurcharge,
    handlingAdjustment,
    totalShipping,
    estimatedWindow,
    dispatchTier,
  };
}
```

### 6.9 `src/App.jsx`
```jsx
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
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition inline-flex items-center justify-center gap-2 shrink-0"
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
                      className="inline-flex items-center gap-1 text-xs font-mono bg-white hover:bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-emerald-200 transition"
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
                    {lookupResult.data.recent_house_address.recent}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block text-[11px]">State</span>
                    <span className="font-semibold text-slate-800">
                      {lookupResult.data.administrative_address.state_name}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block text-[11px]">LGA</span>
                    <span className="font-semibold text-slate-800">
                      {lookupResult.data.administrative_address.lga_name}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block text-[11px]">Locality</span>
                    <span className="font-semibold text-slate-800">
                      {lookupResult.data.administrative_address.locality_name}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-400 block text-[11px]">Geopolitical Zone</span>
                    <span className="font-semibold text-slate-800">
                      {lookupResult.data.administrative_address.zone}
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
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold py-3 rounded-lg text-sm transition"
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
                  {lookupResult.data.recent_house_address.recent} —{" "}
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
```

---

## 7. Verification Checklist & Live Showcase Demo Script

### 7.1 Automated & Manual Verification Steps for Antigravity IDE
1. **Install & Start:** Run `npm install` followed by `npm run dev`.
2. **Test Normalization:** Type `fc 01 a01 kp 27` (lowercase with spaces) or `FC01A01KP27` (compact) into the postcode input and click **Verify Postcode**. Confirm it normalizes to `FC-01-A01-KP-27`.
3. **Test Segment Validation Rules:** Type `LA-00-W06-TC-10` (using `00` for the LGA segment) and click **Verify Postcode**. Confirm the client-side validator rejects it because numeric segments must be `01` to `99`.
4. **Test Commercial vs. Residential Pricing:**
   - Click `LA-11-W06-TC-10` (Lagos Residential) and observe the base rate of `₦1,800` + LGA surcharge of `₦300` = `₦2,100`.
   - Click `FC-01-A01-KP-27` (Abuja Commercial) and observe the `₦200` Commercial Building Reception Drop-Off Discount applied automatically.

### 7.2 90-Second Pitch Script for YouTube Live Showcase (`pitch.postcode.gov.ng`)
- **0:00 – 0:20 (The Problem):** "Every day, Nigerian online stores and logistics hubs lose hours calling buyers to clarify ambiguous street addresses and haggling over delivery fees. We built **NaijaCart Instant Checkout** on the official NIPOST Postcode API to turn checkout into a single 11-character lookup."
- **0:20 – 0:55 (Live Demo):** "Watch what happens when a customer types their NIPOST code—even without hyphens, like `fc 01 a01 kp 27`. Our app normalizes the code into NIPOST's canonical format, queries the `/v1/lookup` Level 3 endpoint, and locks in the verified building address. Because NIPOST codes are building-specific, the customer only adds their flat or suite number."
- **0:55 – 1:30 (Segment Pricing & Impact):** "On the right, our pricing engine disassembles the 5 segments—State, LGA, District, Area, and Unit—plus the `building_use_status` field from the NIPOST API to calculate exact delivery fees and assign the package to the right dispatch hub automatically. No phone calls, no failed deliveries."