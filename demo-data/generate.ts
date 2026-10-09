/**
 * WabiSaviArt — Demo Data Generator
 * Generates realistic marketplace demo data as CSV files (one per Prisma model)
 * and zips them into a backup-compatible archive: demo-data/wabisaviart-demo.zip
 *
 * Usage (from repo root): ~/.bun/bin/bun run demo-data/generate.ts
 *
 * All passwords: Demo@123456
 */

import { createWriteStream } from "fs";
import * as path from "path";
import archiver from "archiver";
import bcrypt from "bcrypt";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const uuid = () => crypto.randomUUID();

function isoNow(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}
function isoPast(daysAgo: number) { return isoNow(-daysAgo); }

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (s.includes('"') || s.includes(",") || s.includes("\n"))
    return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map(h => csvEscape(row[h])).join(","));
  return lines.join("\n");
}

// ─── Fixed IDs (so foreign keys line up across tables) ────────────────────────

const ADMIN_ID       = uuid();
const S_USER         = [uuid(), uuid(), uuid()];   // seller users
const S_PROF         = [uuid(), uuid(), uuid()];   // seller profiles
const C_IDS          = [uuid(), uuid(), uuid(), uuid(), uuid()]; // customers
const CAT_IDS        = [uuid(), uuid(), uuid(), uuid()];
const SUBCAT_IDS     = [[uuid(), uuid()], [uuid(), uuid()], [uuid(), uuid()], [uuid()]];
const PROD_IDS       = [[uuid(), uuid(), uuid()], [uuid(), uuid(), uuid()], [uuid(), uuid(), uuid()]];
const VAR_IDS        = PROD_IDS.map(ps => ps.map(() => [uuid(), uuid()]));
const ORD_IDS        = Array.from({length: 12}, uuid);
const SHIP_IDS       = ORD_IDS.map(uuid);
const PM_IDS         = C_IDS.map(uuid);
const TX_IDS         = ORD_IDS.map(uuid);
const CPN_IDS        = S_PROF.map(uuid);
const REV_IDS        = Array.from({length: 10}, uuid);
const WL_IDS         = C_IDS.map(uuid);
const CART_IDS       = C_IDS.map(uuid);
const CONV_IDS       = Array.from({length: 5}, uuid);
const TKT_IDS        = [uuid(), uuid(), uuid()];
const POUT_IDS       = S_PROF.map(uuid);
const JRNL_IDS       = S_PROF.map(uuid);
const PROMO_IDS      = [uuid(), uuid()];

// ─── Password hash ─────────────────────────────────────────────────────────────

console.log("⏳ Hashing passwords (this takes a few seconds)…");
const PW_HASH = bcrypt.hashSync("Demo@123456", 10);
console.log("✅ Hash ready");

// ─── Builders ─────────────────────────────────────────────────────────────────

function users() {
  const H = ["id","email","phoneNumber","passwordHash","fullName","dob","role","avatarUrl",
    "emailVerified","phoneVerified","isActive","twoFactorEnabled","otpProvider",
    "marketingEmailsEnabled","acceptSellerAgreement","isVip","stripeCustomerId",
    "lastLoginAt","lastLoginIp","deletedAt","createdAt","updatedAt"];

  const R: Record<string,unknown>[] = [
    { id:ADMIN_ID, email:"admin@wabisaviart.com", phoneNumber:"+18005550001",
      passwordHash:PW_HASH, fullName:"Admin User", dob:"1985-03-15T00:00:00.000Z",
      role:"admin", avatarUrl:"placeholders/seed-admin.jpg",
      emailVerified:true, phoneVerified:true, isActive:true, twoFactorEnabled:false,
      otpProvider:"email", marketingEmailsEnabled:false, acceptSellerAgreement:false,
      isVip:false, stripeCustomerId:null, lastLoginAt:isoPast(1), lastLoginIp:"127.0.0.1",
      deletedAt:null, createdAt:isoPast(180), updatedAt:isoPast(1) },
    ...S_USER.map((id,i) => ({
      id, email:`seller${i+1}@demo.com`, phoneNumber:`+1800555001${i+1}`,
      passwordHash:PW_HASH,
      fullName:["Emma Woodcraft","Liam Pottery","Sofia Textiles"][i],
      dob:["1990-06-20T00:00:00.000Z","1988-11-10T00:00:00.000Z","1993-04-05T00:00:00.000Z"][i],
      role:"seller", avatarUrl:"placeholders/profile-placeholder.png",
      emailVerified:true, phoneVerified:true, isActive:true, twoFactorEnabled:false,
      otpProvider:"email", marketingEmailsEnabled:true, acceptSellerAgreement:true,
      isVip:false, stripeCustomerId:`cus_demo_seller_${i+1}`,
      lastLoginAt:isoPast(i+1), lastLoginIp:"127.0.0.1",
      deletedAt:null, createdAt:isoPast(120+i*10), updatedAt:isoPast(i+1) })),
    ...C_IDS.map((id,i) => ({
      id, email:`customer${i+1}@demo.com`, phoneNumber:`+1800555002${i+1}`,
      passwordHash:PW_HASH,
      fullName:["Alice Johnson","Bob Martinez","Carol White","David Kim","Eve Thompson"][i],
      dob:["1995-01-12T00:00:00.000Z","1992-07-22T00:00:00.000Z","1998-03-30T00:00:00.000Z","1991-09-18T00:00:00.000Z","1996-12-05T00:00:00.000Z"][i],
      role:"customer", avatarUrl:"placeholders/profile-placeholder.png",
      emailVerified:true, phoneVerified:i<3, isActive:true, twoFactorEnabled:false,
      otpProvider:"email", marketingEmailsEnabled:i%2===0, acceptSellerAgreement:false,
      isVip:i===0, stripeCustomerId:`cus_demo_customer_${i+1}`,
      lastLoginAt:isoPast(i), lastLoginIp:"127.0.0.1",
      deletedAt:null, createdAt:isoPast(90+i*5), updatedAt:isoPast(i) }))
  ];
  return toCsv(H,R);
}

function sellerProfiles() {
  const H = ["id","userId","stripeAccountId","stripeOnboardingDone","stripeChargesEnabled",
    "stripePayoutsEnabled","shopName","shopDescription","shopAnnouncement","shopBannerImage",
    "shopLogo","address","shopLatitude","shopLongitude","shopPolicies","returnPolicy",
    "privacyPolicy","shippingPolicy","totalSales","totalReviews","averageRating",
    "isVerified","isFeatured","isActive","proofOfIdentity","sampleProducts",
    "isAgreedToTermsAndConditions","isHandcraftedOrEthicallySourced","verificationDate",
    "isVerifiedByAdmin","facebookUrl","instagramUrl","twitterUrl","websiteUrl","createdAt","updatedAt"];

  const shops = [
    { name:"EmmaWoodcraft", desc:"Handmade wooden art and home decor crafted with love. Each piece is unique, natural, and sustainably sourced.", ann:"Summer Sale - 20% off all carvings this week!", lat:40.7128, lng:-74.006, addr:"12 Oak Street, Brooklyn, NY 11201, USA", sales:342, reviews:128, rating:"4.85", ver:true, feat:true },
    { name:"LiamCeramics", desc:"Contemporary hand-thrown pottery for everyday use. From mugs to vases, each piece tells a story.", ann:"New collection just dropped - Limited edition glazed bowls!", lat:34.0522, lng:-118.2437, addr:"88 Clay Ave, Los Angeles, CA 90012, USA", sales:215, reviews:87, rating:"4.72", ver:true, feat:false },
    { name:"SofiaTextiles", desc:"Ethically woven textiles and handmade fabric art inspired by global cultures.", ann:"New throw blankets available now in limited quantities!", lat:41.8781, lng:-87.6298, addr:"230 Weave Lane, Chicago, IL 60601, USA", sales:178, reviews:63, rating:"4.61", ver:false, feat:false }
  ];

  const R = shops.map((s,i) => ({
    id:S_PROF[i], userId:S_USER[i], stripeAccountId:`acct_demo_${i+1}`,
    stripeOnboardingDone:true, stripeChargesEnabled:true, stripePayoutsEnabled:true,
    shopName:s.name, shopDescription:s.desc, shopAnnouncement:s.ann,
    shopBannerImage:"placeholders/image-placeholder.png", shopLogo:"placeholders/image-placeholder.png",
    address:s.addr, shopLatitude:s.lat, shopLongitude:s.lng,
    shopPolicies:"We are committed to quality craftsmanship and customer satisfaction.",
    returnPolicy:"30-day returns accepted. Items must be unused and in original condition.",
    privacyPolicy:"We respect your privacy and never share your data with third parties.",
    shippingPolicy:"Ships within 3-5 business days. International shipping available.",
    totalSales:s.sales, totalReviews:s.reviews, averageRating:s.rating,
    isVerified:s.ver, isFeatured:s.feat, isActive:true, proofOfIdentity:null,
    sampleProducts:"[]", isAgreedToTermsAndConditions:true, isHandcraftedOrEthicallySourced:true,
    verificationDate:s.ver?isoPast(60):null, isVerifiedByAdmin:s.ver,
    facebookUrl:`https://facebook.com/${s.name.toLowerCase()}`,
    instagramUrl:`https://instagram.com/${s.name.toLowerCase()}`,
    twitterUrl:null, websiteUrl:null,
    createdAt:isoPast(120+i*10), updatedAt:isoPast(i+1) }));
  return toCsv(H,R);
}

function categories() {
  const H = ["id","name","type","description","promotionId","isFeatured","isGoodForGift","isActive","createdAt","updatedAt"];
  const cats = [
    {name:"Woodcraft & Carving",type:"crafts",desc:"Hand-carved wooden art, furniture, and home decor.",feat:true,gift:true},
    {name:"Ceramics & Pottery",type:"crafts",desc:"Handmade clay, porcelain, and stoneware creations.",feat:true,gift:true},
    {name:"Textiles & Fiber Arts",type:"crafts",desc:"Woven, knitted, and embroidered fabric art.",feat:false,gift:false},
    {name:"Vintage Collectibles",type:"vintage",desc:"Curated vintage and antique items from past eras.",feat:false,gift:false}
  ];
  const R = cats.map((c,i) => ({id:CAT_IDS[i],name:c.name,type:c.type,description:c.desc,
    promotionId:null,isFeatured:c.feat,isGoodForGift:c.gift,isActive:true,
    createdAt:isoPast(150),updatedAt:isoPast(30)}));
  return toCsv(H,R);
}

function subCategories() {
  const H = ["id","categoryId","name","description","isActive","createdAt","updatedAt"];
  const subs = [
    [{name:"Wall Art",desc:"Carved wood panels and wall hangings"},{name:"Kitchenware",desc:"Wooden spoons, cutting boards, and bowls"}],
    [{name:"Mugs & Cups",desc:"Handmade ceramic mugs and cups"},{name:"Vases & Planters",desc:"Ceramic vases and decorative planters"}],
    [{name:"Throw Blankets",desc:"Woven and knitted blankets"},{name:"Wall Tapestries",desc:"Decorative fabric wall art"}],
    [{name:"Vintage Jewelry",desc:"Antique rings, necklaces, and brooches"}]
  ];
  const R: Record<string,unknown>[] = [];
  subs.forEach((catSubs,ci) => catSubs.forEach((s,si) => R.push({
    id:SUBCAT_IDS[ci][si],categoryId:CAT_IDS[ci],name:s.name,description:s.desc,
    isActive:true,createdAt:isoPast(140),updatedAt:isoPast(30)})));
  return toCsv(H,R);
}

function promotions() {
  const H = ["id","sellerId","name","discountType","discountValue","applyTo","startDate","endDate","isActive","minimumPurchase","usageLimit","usageCount","onePerCustomer","createdAt","updatedAt"];
  const R = [
    {id:PROMO_IDS[0],sellerId:S_PROF[0],name:"Summer Wood Sale",discountType:"PERCENTAGE",discountValue:20,applyTo:"ALL_PRODUCTS",startDate:isoPast(14),endDate:isoNow(14),isActive:true,minimumPurchase:50,usageLimit:200,usageCount:47,onePerCustomer:false,createdAt:isoPast(15),updatedAt:isoPast(1)},
    {id:PROMO_IDS[1],sellerId:S_PROF[1],name:"New Collection Launch",discountType:"FIXED",discountValue:10,applyTo:"ALL_PRODUCTS",startDate:isoPast(7),endDate:isoNow(7),isActive:true,minimumPurchase:40,usageLimit:100,usageCount:23,onePerCustomer:true,createdAt:isoPast(8),updatedAt:isoPast(1)}
  ];
  return toCsv(H,R);
}

function products() {
  const H = ["id","sellerId","title","subtitle","description","badge","price","currency",
    "discountType","discountValue","trackInventory","lowStockThreshold","status","categoryType",
    "categoryId","subCategoryId","promotionId","isFeatured","tags","customizable","handmade",
    "madeToOrder","processingTime","favoriteCount","salesCount","reportCount","averageRating",
    "deletedAt","createdAt","updatedAt"];

  type PD = {title:string;subtitle:string;desc:string;badge:string;price:number;dt:string;dv:number;ci:number;sci:number;tags:string[];feat:boolean;cust:boolean;sales:number;fav:number;rating:string};
  const defs: PD[][] = [
    [
      {title:"Hand-Carved Oak Wall Panel",subtitle:"Nature-Inspired Relief Carving",desc:"A stunning hand-carved oak wall panel featuring a flowing forest scene. Each piece is one-of-a-kind, sanded smooth and finished with natural beeswax oil. Dimensions: 60x40 cm.",badge:"bestseller",price:189.99,dt:"percentage",dv:20,ci:0,sci:0,tags:["wall art","wood carving","oak","home decor","handmade"],feat:true,cust:false,sales:87,fav:245,rating:"4.90"},
      {title:"Personalized Wooden Cutting Board",subtitle:"Custom Engraved Kitchen Gift",desc:"A beautiful maple cutting board with custom laser-engraved monogram or family name. Food-safe mineral oil finish. Perfect as a wedding or housewarming gift. 45x30 cm.",badge:"new",price:64.50,dt:"none",dv:0,ci:0,sci:1,tags:["cutting board","personalized","kitchen","gift","maple"],feat:false,cust:true,sales:142,fav:312,rating:"4.95"},
      {title:"Rustic Wood Candle Holder Set",subtitle:"Set of 3 Reclaimed Pine Holders",desc:"Three rustic candle holders crafted from reclaimed pine wood. Natural knots and grain patterns make each set unique. Ideal for farmhouse or boho decor. Heights: 8, 12, 16 cm.",badge:"sale",price:38.00,dt:"percentage",dv:20,ci:0,sci:0,tags:["candle holder","rustic","pine","reclaimed wood","set"],feat:false,cust:false,sales:113,fav:189,rating:"4.80"}
    ],
    [
      {title:"Hand-Thrown Stoneware Mug",subtitle:"Cozy 350ml Everyday Mug",desc:"A beautifully hand-thrown stoneware mug with a comfortable handle and reactive glaze. Microwave and dishwasher safe. Capacity: 350ml. Available in 5 glaze colors.",badge:"bestseller",price:34.00,dt:"fixed",dv:10,ci:1,sci:0,tags:["mug","stoneware","handmade","pottery","coffee"],feat:true,cust:false,sales:215,fav:478,rating:"4.75"},
      {title:"Ceramic Vase with Crackle Glaze",subtitle:"Modern Minimalist Bud Vase",desc:"A modern hand-built vase featuring a striking crackle glaze finish. Perfect for a single stem or small floral arrangement. Height: 22 cm.",badge:"new",price:52.00,dt:"fixed",dv:10,ci:1,sci:1,tags:["vase","ceramic","crackle glaze","minimalist","floral"],feat:false,cust:false,sales:67,fav:156,rating:"4.70"},
      {title:"Handmade Ceramic Planter Set",subtitle:"3-Piece Succulent Planter Collection",desc:"A set of three small ceramic planters in graduated sizes, featuring a matte white glaze with subtle texture. Drainage holes included. Heights: 8, 10, 12 cm.",badge:"new",price:48.00,dt:"none",dv:0,ci:1,sci:1,tags:["planter","succulent","ceramic","set","minimalist"],feat:false,cust:false,sales:45,fav:98,rating:"4.65"}
    ],
    [
      {title:"Hand-Woven Merino Throw Blanket",subtitle:"Chunky Knit 100% Merino Wool",desc:"A luxuriously soft hand-woven throw blanket in 100% merino wool. The open weave design gives it a beautiful drape. Perfect for cozy evenings. Size: 130x180 cm.",badge:"bestseller",price:129.00,dt:"none",dv:0,ci:2,sci:0,tags:["blanket","merino wool","throw","handmade","cozy"],feat:true,cust:false,sales:94,fav:287,rating:"4.85"},
      {title:"Macrame Wall Tapestry",subtitle:"Boho Wall Hanging Natural Cotton",desc:"A beautiful macrame wall tapestry hand-knotted from natural unbleached cotton cord. Features layered fringe and geometric patterns. Width: 60 cm, Length: 90 cm.",badge:"new",price:78.00,dt:"none",dv:0,ci:2,sci:1,tags:["macrame","wall hanging","boho","cotton","tapestry"],feat:false,cust:false,sales:56,fav:167,rating:"4.60"},
      {title:"Embroidered Linen Cushion Cover",subtitle:"Hand-Embroidered Floral Design",desc:"A hand-embroidered linen cushion cover featuring delicate floral motifs in muted earth tones. 45x45 cm, hidden zip closure. Insert not included.",badge:"new",price:42.00,dt:"none",dv:0,ci:2,sci:1,tags:["cushion","embroidery","linen","floral","handmade"],feat:false,cust:true,sales:38,fav:94,rating:"4.55"}
    ]
  ];

  const R: Record<string,unknown>[] = [];
  defs.forEach((sps,si) => sps.forEach((p,pi) => R.push({
    id:PROD_IDS[si][pi], sellerId:S_USER[si], title:p.title, subtitle:p.subtitle,
    description:p.desc, badge:p.badge, price:p.price, currency:"USD",
    discountType:p.dt, discountValue:p.dv>0?p.dv:null, trackInventory:true,
    lowStockThreshold:5, status:"active", categoryType:"crafts",
    categoryId:CAT_IDS[p.ci], subCategoryId:SUBCAT_IDS[p.ci][p.sci],
    promotionId:si===0?PROMO_IDS[0]:si===1?PROMO_IDS[1]:null,
    isFeatured:p.feat, tags:JSON.stringify(p.tags), customizable:p.cust,
    handmade:true, madeToOrder:p.cust, processingTime:p.cust?7:3,
    favoriteCount:p.fav, salesCount:p.sales, reportCount:0, averageRating:p.rating,
    deletedAt:null, createdAt:isoPast(90-si*10-pi*5), updatedAt:isoPast(si+pi+1) })));
  return toCsv(H,R);
}

function productVariants() {
  const H = ["id","productId","mediaUrl","name","quantity","options","isLowStock","isActive","createdAt","updatedAt"];
  const vdefs = [
    [{name:"Small (30x20 cm)",opts:{size:"Small"},qty:8},{name:"Large (60x40 cm)",opts:{size:"Large"},qty:4}],
    [{name:"Standard (45x30 cm)",opts:{size:"Standard"},qty:15},{name:"Large (60x40 cm)",opts:{size:"Large"},qty:8}],
    [{name:"Natural Pine",opts:{finish:"Natural"},qty:12},{name:"Dark Walnut Stain",opts:{finish:"Dark Walnut"},qty:7}],
    [{name:"Ocean Blue Glaze",opts:{color:"Ocean Blue"},qty:20},{name:"Forest Green Glaze",opts:{color:"Forest Green"},qty:18}],
    [{name:"Short (15 cm)",opts:{height:"15 cm"},qty:10},{name:"Tall (22 cm)",opts:{height:"22 cm"},qty:7}],
    [{name:"Matte White",opts:{glaze:"Matte White"},qty:14},{name:"Speckled Grey",opts:{glaze:"Speckled Grey"},qty:9}],
    [{name:"Ivory White",opts:{color:"Ivory White"},qty:6},{name:"Warm Grey",opts:{color:"Warm Grey"},qty:5}],
    [{name:"Small (40x60 cm)",opts:{size:"Small"},qty:11},{name:"Large (60x90 cm)",opts:{size:"Large"},qty:8}],
    [{name:"Natural Linen",opts:{color:"Natural"},qty:13},{name:"Sage Green",opts:{color:"Sage Green"},qty:6}]
  ];
  const R: Record<string,unknown>[] = [];
  let idx=0;
  PROD_IDS.forEach((sps,si) => sps.forEach((productId,pi) => {
    vdefs[idx++].forEach((v,vi) => R.push({
      id:VAR_IDS[si][pi][vi], productId, mediaUrl:"placeholders/image-placeholder.png",
      name:v.name, quantity:v.qty, options:JSON.stringify(v.opts),
      isLowStock:v.qty<=5, isActive:true,
      createdAt:isoPast(85-si*10-pi*5), updatedAt:isoPast(si+pi+2) }));
  }));
  return toCsv(H,R);
}

function addresses() {
  const H = ["id","userId","fullName","addressLine1","addressLine2","city","stateProvince","postalCode","country","phoneNumber","isDefaultShipping","isDefaultBilling","label","createdAt","updatedAt"];
  const addrs = [
    {full:"Alice Johnson",line1:"45 Maple Dr",city:"Austin",state:"TX",zip:"73301",country:"US",phone:"+15125550101"},
    {full:"Bob Martinez",line1:"88 Oak Blvd",city:"Miami",state:"FL",zip:"33101",country:"US",phone:"+13055550202"},
    {full:"Carol White",line1:"12 Pine St",city:"Seattle",state:"WA",zip:"98101",country:"US",phone:"+12065550303"},
    {full:"David Kim",line1:"300 Elm Ave",city:"Boston",state:"MA",zip:"02101",country:"US",phone:"+16175550404"},
    {full:"Eve Thompson",line1:"7 Cedar Ln",city:"Denver",state:"CO",zip:"80201",country:"US",phone:"+17205550505"}
  ];
  const R = C_IDS.map((userId,i) => ({id:uuid(),userId,fullName:addrs[i].full,addressLine1:addrs[i].line1,
    addressLine2:null,city:addrs[i].city,stateProvince:addrs[i].state,postalCode:addrs[i].zip,
    country:addrs[i].country,phoneNumber:addrs[i].phone,isDefaultShipping:true,isDefaultBilling:true,
    label:"Home",createdAt:isoPast(80),updatedAt:isoPast(10)}));
  return toCsv(H,R);
}

function coupons() {
  const H = ["id","sellerId","code","discountType","description","discountValue","minimumPurchase","minimumPurchaseAmount","maximumDiscount","buyQuantity","getQuantity","usageLimit","maximumUses","usageLimitPerUser","usedCount","usageCount","startsAt","expiresAt","customerRestriction","isActive","createdAt","updatedAt"];
  const defs = [
    {code:"WOOD20",type:"PERCENTAGE",val:20,desc:"20% off all woodcraft items",min:50,maxD:100,uses:47},
    {code:"CLAY10",type:"FIXED",val:10,desc:"$10 off ceramic orders over $40",min:40,maxD:null,uses:23},
    {code:"TEXTILE15",type:"PERCENTAGE",val:15,desc:"15% off textile orders",min:60,maxD:50,uses:12}
  ];
  const R = CPN_IDS.map((id,i) => ({id,sellerId:S_PROF[i],code:defs[i].code,discountType:defs[i].type,
    description:defs[i].desc,discountValue:defs[i].val,minimumPurchase:defs[i].min,
    minimumPurchaseAmount:defs[i].min,maximumDiscount:defs[i].maxD,buyQuantity:null,getQuantity:null,
    usageLimit:200,maximumUses:200,usageLimitPerUser:1,usedCount:defs[i].uses,usageCount:defs[i].uses,
    startsAt:isoPast(30),expiresAt:isoNow(60),customerRestriction:"ALL_CUSTOMERS",isActive:true,
    createdAt:isoPast(31),updatedAt:isoPast(1)}));
  return toCsv(H,R);
}

function orders() {
  const H = ["id","orderNumber","stripePaymentIntentId","stripeChargeId","buyerId","sellerId",
    "status","subtotal","shippingCost","taxAmount","discountAmount","tipAmount","totalAmount",
    "currency","shippingAddressId","couponId","couponCode","markOrderAsGift","buyerNote",
    "sellerNote","internalNote","ipAddress","userAgent","paidAt","shippedAt","deliveredAt",
    "cancelledAt","dispatchedAt","sourceCampaign","acquisitionCost","refundInitiatedAt",
    "refundApprovedAt","refundCompletedAt","createdAt","updatedAt"];

  type OD = {bi:number;si:number;status:string;sub:number;ship:number;tax:number;disc:number;total:number;da:number;ci:number|null};
  const defs: OD[] = [
    {bi:0,si:0,status:"delivered",sub:189.99,ship:12,tax:15.20,disc:0,total:217.19,da:60,ci:null},
    {bi:1,si:0,status:"delivered",sub:64.50,ship:8,tax:5.16,disc:12.90,total:64.76,da:55,ci:0},
    {bi:2,si:1,status:"delivered",sub:68.00,ship:10,tax:5.44,disc:20,total:63.44,da:50,ci:1},
    {bi:3,si:1,status:"delivered",sub:52.00,ship:9,tax:4.16,disc:0,total:65.16,da:45,ci:null},
    {bi:4,si:2,status:"delivered",sub:129.00,ship:15,tax:10.32,disc:0,total:154.32,da:40,ci:null},
    {bi:0,si:2,status:"delivered",sub:78.00,ship:10,tax:6.24,disc:0,total:94.24,da:35,ci:null},
    {bi:1,si:0,status:"shipped",sub:38.00,ship:8,tax:3.04,disc:7.60,total:41.44,da:20,ci:0},
    {bi:2,si:1,status:"in_transit",sub:34.00,ship:7,tax:2.72,disc:10,total:33.72,da:15,ci:1},
    {bi:3,si:2,status:"processing",sub:42.00,ship:8,tax:3.36,disc:0,total:53.36,da:8,ci:null},
    {bi:4,si:0,status:"processing",sub:64.50,ship:8,tax:5.16,disc:0,total:77.66,da:5,ci:null},
    {bi:0,si:1,status:"paid",sub:48.00,ship:9,tax:3.84,disc:0,total:60.84,da:2,ci:null},
    {bi:1,si:2,status:"cancelled",sub:129.00,ship:15,tax:10.32,disc:0,total:154.32,da:30,ci:null}
  ];

  const R = defs.map((d,i) => {
    const base = new Date(); base.setDate(base.getDate()-d.da);
    const paidAt = base.toISOString();
    const shipped = ["shipped","in_transit","delivered"].includes(d.status);
    const shippedAt = shipped ? new Date(base.getTime()+2*86400000).toISOString() : null;
    const deliveredAt = d.status==="delivered" ? new Date(base.getTime()+7*86400000).toISOString() : null;
    const cancelledAt = d.status==="cancelled" ? new Date(base.getTime()+86400000).toISOString() : null;
    return {
      id:ORD_IDS[i], orderNumber:`ORD-2026${String(i+1).padStart(4,"0")}-${Math.random().toString(36).substring(2,10).toUpperCase()}`,
      stripePaymentIntentId:d.status!=="cancelled"?`pi_demo_${i+1}`:null,
      stripeChargeId:d.status!=="cancelled"?`ch_demo_${i+1}`:null,
      buyerId:C_IDS[d.bi], sellerId:S_PROF[d.si], status:d.status,
      subtotal:d.sub, shippingCost:d.ship, taxAmount:d.tax, discountAmount:d.disc,
      tipAmount:0, totalAmount:d.total, currency:"USD", shippingAddressId:null,
      couponId:d.ci!==null?CPN_IDS[d.ci]:null,
      couponCode:d.ci!==null?["WOOD20","CLAY10","TEXTILE15"][d.ci]:null,
      markOrderAsGift:false, buyerNote:null, sellerNote:null, internalNote:null,
      ipAddress:"127.0.0.1", userAgent:"Mozilla/5.0 (Demo)",
      paidAt, shippedAt, deliveredAt, cancelledAt, dispatchedAt:shippedAt,
      sourceCampaign:i<4?"organic":null, acquisitionCost:null,
      refundInitiatedAt:null, refundApprovedAt:null, refundCompletedAt:null,
      createdAt:isoPast(d.da), updatedAt:deliveredAt||shippedAt||isoPast(d.da)
    };
  });
  return toCsv(H,R);
}

function orderItems() {
  const H = ["id","orderId","productId","variantId","productTitle","productSlug","variantName","sku","imageUrl","quantity","unitPrice","totalPrice","customization","giftMessage","createdAt"];
  const allP = PROD_IDS.flat();
  const allV = VAR_IDS.flat().map(v => v[0]);
  const titles = ["Hand-Carved Oak Wall Panel","Personalized Wooden Cutting Board","Rustic Wood Candle Holder Set","Hand-Thrown Stoneware Mug","Ceramic Vase with Crackle Glaze","Handmade Ceramic Planter Set","Hand-Woven Merino Throw Blanket","Macrame Wall Tapestry","Embroidered Linen Cushion Cover"];
  const slugs = titles.map(t => t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""));
  const prices = [189.99,64.50,38.00,34.00,52.00,48.00,129.00,78.00,42.00];
  const vnames = ["Small (30x20 cm)","Standard (45x30 cm)","Natural Pine","Ocean Blue Glaze","Tall (22 cm)","Matte White","Ivory White","Large (60x90 cm)","Natural Linen"];
  const map = [0,1,3,4,6,7,2,3,8,1,5,6];
  const R = ORD_IDS.map((orderId,oi) => {
    const pi=map[oi];
    const qty=oi%3===0?2:1;
    return {id:uuid(),orderId,productId:allP[pi],variantId:allV[pi],
      productTitle:titles[pi],productSlug:slugs[pi],variantName:vnames[pi],
      sku:`SKU-${String(pi+1).padStart(4,"0")}`,imageUrl:"placeholders/image-placeholder.png",
      quantity:qty,unitPrice:prices[pi],totalPrice:prices[pi]*qty,
      customization:pi===1?"Engrave: The Johnson Family":null,
      giftMessage:oi===0?"Happy Birthday!":null,createdAt:isoPast(60-oi*3)};
  });
  return toCsv(H,R);
}

function orderStatusHistories() {
  const H = ["id","orderId","status","note","createdBy","createdAt"];
  const chains: {status:string;da:number}[][] = [
    [{status:"paid",da:60},{status:"processing",da:59},{status:"shipped",da:57},{status:"delivered",da:53}],
    [{status:"paid",da:55},{status:"processing",da:54},{status:"shipped",da:52},{status:"delivered",da:48}],
    [{status:"paid",da:50},{status:"processing",da:49},{status:"shipped",da:47},{status:"delivered",da:43}],
    [{status:"paid",da:45},{status:"processing",da:44},{status:"shipped",da:42},{status:"delivered",da:38}],
    [{status:"paid",da:40},{status:"processing",da:39},{status:"shipped",da:37},{status:"delivered",da:33}],
    [{status:"paid",da:35},{status:"processing",da:34},{status:"shipped",da:32},{status:"delivered",da:28}],
    [{status:"paid",da:20},{status:"processing",da:19},{status:"shipped",da:18}],
    [{status:"paid",da:15},{status:"processing",da:14},{status:"in_transit",da:12}],
    [{status:"paid",da:8},{status:"processing",da:7}],
    [{status:"paid",da:5},{status:"processing",da:4}],
    [{status:"paid",da:2}],
    [{status:"pending_payment",da:30},{status:"cancelled",da:29}]
  ];
  const R: Record<string,unknown>[] = [];
  ORD_IDS.forEach((orderId,oi) => (chains[oi]??[]).forEach(s => R.push({
    id:uuid(),orderId,status:s.status,note:null,createdBy:null,createdAt:isoPast(s.da)})));
  return toCsv(H,R);
}

function paymentMethods() {
  const H = ["id","userId","cardBrand","cardLast4","cardExpMonth","cardExpYear","billingName","billingAddress","billingCity","billingState","billingZip","billingCountry","stripePaymentMethodId","isDefault","isActive","createdAt","updatedAt"];
  const brands=["visa","mastercard","amex","visa","mastercard"];
  const last4s=["4242","5555","3782","1234","9876"];
  const names=["Alice Johnson","Bob Martinez","Carol White","David Kim","Eve Thompson"];
  const R = C_IDS.map((userId,i) => ({id:PM_IDS[i],userId,cardBrand:brands[i],cardLast4:last4s[i],
    cardExpMonth:(i%12)+1,cardExpYear:2027+(i%3),billingName:names[i],billingAddress:null,
    billingCity:null,billingState:null,billingZip:null,billingCountry:"US",
    stripePaymentMethodId:`pm_demo_${i+1}`,isDefault:true,isActive:true,
    createdAt:isoPast(80),updatedAt:isoPast(5)}));
  return toCsv(H,R);
}

function paymentTransactions() {
  const H = ["id","orderId","paymentMethodId","amount","currency","status","provider","providerTransactionId","providerResponse","failureReason","metadata","processedAt","createdAt"];
  const buyerMap=[0,1,2,3,4,0,1,2,3,4,0,1];
  const amounts=[217.19,64.76,63.44,65.16,154.32,94.24,41.44,33.72,53.36,77.66,60.84,154.32];
  const statuses=["succeeded","succeeded","succeeded","succeeded","succeeded","succeeded","succeeded","succeeded","succeeded","succeeded","succeeded","cancelled"];
  const R = ORD_IDS.map((orderId,oi) => ({id:TX_IDS[oi],orderId,
    paymentMethodId:PM_IDS[buyerMap[oi]],amount:amounts[oi],currency:"USD",
    status:statuses[oi],provider:"stripe",
    providerTransactionId:oi<11?`pi_demo_${oi+1}`:null,
    providerResponse:JSON.stringify({status:statuses[oi],amount:Math.round(amounts[oi]*100)}),
    failureReason:null,metadata:null,
    processedAt:oi<11?isoPast(60-oi*3):null,createdAt:isoPast(60-oi*3)}));
  return toCsv(H,R);
}

function shipments() {
  const H = ["id","orderId","carrier","trackingNumber","trackingUrl","status","shippingLabelUrl","weight","estimatedDeliveryDate","actualDeliveryDate","shippedAt","createdAt","updatedAt"];
  const carriers=["USPS","FedEx","UPS"];
  const statuses=["delivered","delivered","delivered","delivered","delivered","delivered","in_transit","in_transit","pending","pending","pending"];
  const R = ORD_IDS.slice(0,11).map((orderId,oi) => ({id:SHIP_IDS[oi],orderId,
    carrier:carriers[oi%3],trackingNumber:`1Z${Math.random().toString(36).substring(2,12).toUpperCase()}`,
    trackingUrl:`https://tracking.example.com/track/${oi+1}`,status:statuses[oi],
    shippingLabelUrl:null,weight:(1.5+oi*0.3).toFixed(2),
    estimatedDeliveryDate:isoNow(oi<6?-50:7),
    actualDeliveryDate:oi<6?isoNow(-50+oi*5):null,
    shippedAt:oi<8?isoPast(58-oi*3):null,
    createdAt:isoPast(59-oi*3),updatedAt:isoPast(50-oi*3)}));
  return toCsv(H,R);
}

function reviews() {
  const H = ["id","productId","userId","orderId","rating","comment","images","verifiedPurchase","helpfulCount","notHelpfulCount","sellerResponse","sellerRespondedAt","createdAt","updatedAt","platform"];
  type RD = {pi:number;ci:number;oi:number;r:number;c:string;h:number;sr:string|null};
  const defs: RD[] = [
    {pi:0,ci:0,oi:0,r:5,c:"Absolutely stunning! The carving is incredibly detailed and the quality is beyond what I expected. It is now the centrepiece of my living room.",h:24,sr:"Thank you so much, Alice! It was a joy to make this piece. Enjoy!"},
    {pi:1,ci:1,oi:1,r:5,c:"The engraving is perfect — clean, precise, and exactly what I asked for. Great gift for my parents' anniversary!",h:18,sr:null},
    {pi:3,ci:2,oi:2,r:4,c:"Love the mug! The glaze colour is even more beautiful in person. Holds temperature well too. Docking one star only because shipping took longer than expected.",h:12,sr:"Thanks Carol! Apologies for the delay - we are improving our shipping. So glad you love the mug!"},
    {pi:4,ci:3,oi:3,r:5,c:"Beautiful vase. Arrived perfectly packed and the crackle glaze is stunning up close.",h:9,sr:null},
    {pi:6,ci:4,oi:4,r:5,c:"This blanket is INCREDIBLE. So soft and warm. My whole family loves it.",h:31,sr:"So happy to hear this, Eve! Merino wool is such a dream to work with. Enjoy the cosiness!"},
    {pi:7,ci:0,oi:5,r:4,c:"Lovely wall hanging. The macrame knotting is very even and well done. Great quality cotton too.",h:7,sr:null},
    {pi:2,ci:1,oi:6,r:5,c:"These candle holders are gorgeous! The rustic look fits perfectly with my farmhouse decor.",h:15,sr:null},
    {pi:3,ci:2,oi:7,r:4,c:"Good mug, solid construction. The glaze has a small imperfection but honestly adds to the handmade character!",h:5,sr:"Each piece truly is one of a kind! Thanks for your positive spirit, Carol"},
    {pi:0,ci:3,oi:0,r:5,c:"Bought this as a gift for my wife. She was speechless. Emma's work is breathtaking.",h:19,sr:"That means the world to us, David! What a wonderful gift."},
    {pi:5,ci:4,oi:5,r:5,c:"The planter set is adorable. Perfect size for my succulents. Drainage holes are a nice touch!",h:8,sr:null}
  ];
  const allP = PROD_IDS.flat();
  const R = REV_IDS.map((id,i) => ({id,productId:allP[defs[i].pi],userId:C_IDS[defs[i].ci],
    orderId:ORD_IDS[defs[i].oi],rating:defs[i].r,comment:defs[i].c,images:"[]",
    verifiedPurchase:true,helpfulCount:defs[i].h,notHelpfulCount:Math.floor(defs[i].h*0.05),
    sellerResponse:defs[i].sr,sellerRespondedAt:defs[i].sr?isoPast(25-i):null,
    createdAt:isoPast(45-i*3),updatedAt:isoPast(40-i*3),platform:"WABISAVIART"}));
  return toCsv(H,R);
}

function wishlists() {
  const H = ["id","userId","name","description","isPublic","createdAt","updatedAt"];
  return toCsv(H, C_IDS.map((userId,i) => ({id:WL_IDS[i],userId,name:"My Favourites",
    description:null,isPublic:i===0,createdAt:isoPast(70),updatedAt:isoPast(5)})));
}

function wishlistItems() {
  const H = ["id","wishlistId","productId","note","addedAt"];
  const pairs=[[0,3],[0,6],[1,0],[1,7],[2,1],[2,4],[3,6],[3,2],[4,5],[4,8]];
  return toCsv(H, pairs.map(([wi,pi]) => ({id:uuid(),wishlistId:WL_IDS[wi],
    productId:PROD_IDS.flat()[pi],note:null,addedAt:isoPast(30+wi*5)})));
}

function carts() {
  const H = ["id","userId","status","createdAt","updatedAt"];
  return toCsv(H, C_IDS.map((userId,i) => ({id:CART_IDS[i],userId,status:"active",
    createdAt:isoPast(10+i),updatedAt:isoPast(i)})));
}

function cartItems() {
  const H = ["id","cartId","productId","variantId","quantity","customization","addedAt","updatedAt"];
  const items=[[0,2,0,0],[1,5,1,0],[2,7,2,1],[3,8,3,0],[4,0,4,1]];
  return toCsv(H, items.map(([ci,pi,si,vi]) => ({id:uuid(),cartId:CART_IDS[ci],
    productId:PROD_IDS.flat()[pi],variantId:VAR_IDS.flat()[si*2+vi],
    quantity:1,customization:null,addedAt:isoPast(5+ci),updatedAt:isoPast(ci)})));
}

function conversations() {
  const H = ["id","customerId","sellerId","orderId","type","isArchived","lastMessage","lastMessageAt","createdAt"];
  const R = [
    {id:CONV_IDS[0],customerId:C_IDS[0],sellerId:S_PROF[0],orderId:ORD_IDS[0],type:"order_inquiry",isArchived:false,lastMessage:"Thank you! Will the order arrive before Friday?",lastMessageAt:isoPast(3),createdAt:isoPast(10)},
    {id:CONV_IDS[1],customerId:C_IDS[1],sellerId:S_PROF[0],orderId:null,type:"product_inquiry",isArchived:false,lastMessage:"Can you do a custom size for the cutting board?",lastMessageAt:isoPast(2),createdAt:isoPast(7)},
    {id:CONV_IDS[2],customerId:C_IDS[2],sellerId:S_PROF[1],orderId:ORD_IDS[2],type:"order_inquiry",isArchived:false,lastMessage:"Love the mug! Thanks for the quick shipping.",lastMessageAt:isoPast(5),createdAt:isoPast(15)},
    {id:CONV_IDS[3],customerId:C_IDS[3],sellerId:S_PROF[2],orderId:ORD_IDS[4],type:"general",isArchived:false,lastMessage:"Do you ship internationally?",lastMessageAt:isoPast(1),createdAt:isoPast(5)},
    {id:CONV_IDS[4],customerId:C_IDS[4],sellerId:S_PROF[1],orderId:null,type:"product_inquiry",isArchived:true,lastMessage:"What clay do you use for the planters?",lastMessageAt:isoPast(20),createdAt:isoPast(22)}
  ];
  return toCsv(H,R);
}

function chatMessages() {
  const H = ["id","conversationId","senderId","content","attachments","isRead","readAt","createdAt"];
  type M = {ci:number;st:string;si:number;content:string;read:boolean;da:number};
  const msgs: M[] = [
    {ci:0,st:"customer",si:0,content:"Hi! I just placed my order - when can I expect it to arrive?",read:true,da:10},
    {ci:0,st:"seller",si:0,content:"Hello Alice! Your order has been dispatched and should arrive within 5-7 business days. I will send you tracking details shortly.",read:true,da:9},
    {ci:0,st:"customer",si:0,content:"Thank you! Will the order arrive before Friday?",read:false,da:3},
    {ci:1,st:"customer",si:1,content:"Hi Emma! I love your cutting boards. Can you do a custom size - maybe 55x35 cm?",read:true,da:7},
    {ci:1,st:"seller",si:0,content:"Hi Bob! Absolutely - custom sizes are my specialty. The 55x35 would be $75. Would you like to go ahead?",read:false,da:2},
    {ci:2,st:"customer",si:2,content:"My mug just arrived and it is even more beautiful in person! Thank you Liam!",read:true,da:5},
    {ci:2,st:"seller",si:1,content:"That makes my day, Carol! Enjoy your morning coffees in it.",read:true,da:5},
    {ci:3,st:"customer",si:3,content:"Hi! Do you ship internationally? I am in Germany.",read:false,da:1},
    {ci:4,st:"customer",si:4,content:"Hi Sofia! What clay body do you use for the planters?",read:true,da:22},
    {ci:4,st:"seller",si:1,content:"Hi Eve! I use stoneware clay - it is very durable and food-safe too.",read:true,da:21}
  ];
  const R = msgs.map(m => ({id:uuid(),conversationId:CONV_IDS[m.ci],
    senderId:m.st==="customer"?C_IDS[m.si]:S_USER[m.si],content:m.content,
    attachments:"[]",isRead:m.read,readAt:m.read?isoPast(m.da-1):null,createdAt:isoPast(m.da)}));
  return toCsv(H,R);
}

function notifications() {
  const H = ["id","userId","type","title","message","actionUrl","metadata","isRead","readAt","createdAt"];
  const notifs = [
    {userId:C_IDS[0],type:"order_update",title:"Order Shipped!",msg:"Your order has been shipped and is on its way!",url:"/orders/1",read:true,da:55},
    {userId:C_IDS[0],type:"order_update",title:"Order Delivered",msg:"Your order has been delivered. Please leave a review!",url:"/orders/1/review",read:true,da:50},
    {userId:C_IDS[1],type:"order_update",title:"Order Shipped!",msg:"Your order has been shipped!",url:"/orders/2",read:true,da:18},
    {userId:C_IDS[2],type:"message",title:"New Message",msg:"Liam replied to your message",url:"/inbox/3",read:true,da:5},
    {userId:C_IDS[3],type:"promotion",title:"Limited Offer!",msg:"15% off Sofia's textiles this week - use code TEXTILE15",url:"/shop/sofiatextiles",read:false,da:2},
    {userId:S_USER[0],type:"order_update",title:"New Order Received!",msg:"You have a new order from Alice Johnson.",url:"/seller/orders",read:true,da:60},
    {userId:S_USER[1],type:"review",title:"New Review!",msg:"Carol left a 4-star review on your Hand-Thrown Stoneware Mug.",url:"/seller/reviews",read:false,da:40},
    {userId:S_USER[2],type:"order_update",title:"New Order Received!",msg:"You have a new order from Eve Thompson.",url:"/seller/orders",read:true,da:40}
  ];
  const R = notifs.map(n => ({id:uuid(),userId:n.userId,type:n.type,title:n.title,
    message:n.msg,actionUrl:n.url,metadata:null,isRead:n.read,
    readAt:n.read?isoPast(n.da-1):null,createdAt:isoPast(n.da)}));
  return toCsv(H,R);
}

function sellerPayouts() {
  const H = ["id","sellerId","period","grossRevenue","refundsIssued","platformFeePercent","platformFeeAmount","netPayment","status","dueDate","paidDate","paymentMethod","notes","createdAt","updatedAt"];
  const defs = [
    {sid:S_PROF[0],period:"2026-07",gross:1420.50,refunds:0,fee:5.00,net:1349.47},
    {sid:S_PROF[0],period:"2026-08",gross:2180.00,refunds:64.50,fee:5.00,net:2018.25},
    {sid:S_PROF[1],period:"2026-07",gross:890.00,refunds:0,fee:5.00,net:845.50},
    {sid:S_PROF[1],period:"2026-08",gross:1340.00,refunds:0,fee:5.00,net:1273.00},
    {sid:S_PROF[2],period:"2026-07",gross:750.00,refunds:0,fee:5.00,net:712.50},
    {sid:S_PROF[2],period:"2026-08",gross:1050.00,refunds:0,fee:5.00,net:997.50}
  ];
  const R = defs.map((d,i) => ({id:POUT_IDS[i],sellerId:d.sid,period:d.period,
    grossRevenue:d.gross,refundsIssued:d.refunds,platformFeePercent:d.fee,
    platformFeeAmount:(d.gross*d.fee/100).toFixed(2),netPayment:d.net,
    status:i<4?"paid":"pending",dueDate:isoPast(i<4?20:-10),
    paidDate:i<4?isoPast(18-i*2):null,paymentMethod:"bank_transfer",notes:null,
    createdAt:isoPast(45-i*5),updatedAt:isoPast(i+1)}));
  return toCsv(H,R);
}

function shopJournals() {
  const H = ["id","shopId","title","bannerImage","shortExcerpt","content","published","approved","postStatus","createdAt"];
  const defs = [
    {sid:S_PROF[0],title:"The Story Behind My Oak Carvings",excerpt:"How a childhood memory in my grandfather's workshop led to a lifelong passion for wood.",content:"I grew up watching my grandfather carve intricate patterns into oak panels in his small workshop. The smell of fresh sawdust, the rhythmic sound of the chisel - it was magic. Years later I found myself returning to that same craft, trying to capture that same magic in every piece I create. Each wall panel takes between 20 and 40 hours of patient work. It is not just woodworking. It is storytelling in oak."},
    {sid:S_PROF[1],title:"Why I Switched to Stoneware",excerpt:"A ceramicist's journey from earthenware to the beautiful durable world of stoneware clay.",content:"When I first started throwing pots I used earthenware. It was forgiving and cheap - perfect for a beginner. But as my skills grew I felt the limitations. Then I discovered stoneware and everything changed. The way it holds glaze, the weight in your hands, the durability. My mugs are now used daily by hundreds of homes across the US and I could not be more proud."},
    {sid:S_PROF[2],title:"Sourcing Ethical Wool: My Journey",excerpt:"Meeting the shepherds and farms that supply my merino wool - and why it matters.",content:"Before I weave a single thread I visit the farms where my wool comes from. I believe that knowing your materials really knowing them transforms the work. This year I visited three small family farms in Vermont. I watched the shearing, touched the raw fleece, and talked to the people who raise these animals. That connection comes through in every blanket I make."}
  ];
  const R = defs.map((d,i) => ({id:JRNL_IDS[i],shopId:d.sid,title:d.title,
    bannerImage:"placeholders/image-placeholder.png",shortExcerpt:d.excerpt,content:d.content,
    published:true,approved:true,postStatus:"published",createdAt:isoPast(45-i*10)}));
  return toCsv(H,R);
}

function supportTickets() {
  const H = ["id","userId","subject","category","message","status","priority","attachments","resolvedAt","createdAt","updatedAt"];
  const defs = [
    {userId:C_IDS[0],subj:"Order not received after 14 days",cat:"BILLING_PAYMENTS",msg:"I placed an order over two weeks ago and have not received it yet. The tracking number shows no updates since day 3.",status:"RESOLVED",pri:"HIGH",rda:5},
    {userId:C_IDS[3],subj:"Incorrect item shipped",cat:"OTHER",msg:"I received the wrong variant of the ceramic mug. I ordered Ocean Blue but received Forest Green.",status:"IN_PROGRESS",pri:"MEDIUM",rda:null},
    {userId:S_USER[2],subj:"Payout not received for July",cat:"BILLING_PAYMENTS",msg:"My July 2026 payout shows as paid in the dashboard but I have not seen the bank transfer. Please advise.",status:"OPEN",pri:"HIGH",rda:null}
  ];
  const R = TKT_IDS.map((id,i) => ({id,userId:defs[i].userId,subject:defs[i].subj,
    category:defs[i].cat,message:defs[i].msg,status:defs[i].status,priority:defs[i].pri,
    attachments:"[]",resolvedAt:defs[i].rda?isoPast(defs[i].rda):null,
    createdAt:isoPast(20-i*5),updatedAt:isoPast(i+1)}));
  return toCsv(H,R);
}

function customerMetrics() {
  const H = ["id","userId","period","orderCount","totalSpent","avgOrderValue","lastOrderDate","repeatPurchase","npsScore","churnRiskPercent","repurchaseInterval","createdAt","updatedAt"];
  const defs = [
    {ui:0,orders:3,spent:406.67,avg:135.56,nps:9,churn:5},
    {ui:1,orders:2,spent:106.20,avg:53.10,nps:8,churn:15},
    {ui:2,orders:2,spent:97.16,avg:48.58,nps:7,churn:20},
    {ui:3,orders:2,spent:118.52,avg:59.26,nps:8,churn:10},
    {ui:4,orders:2,spent:248.56,avg:124.28,nps:9,churn:8}
  ];
  const R = defs.map(d => ({id:uuid(),userId:C_IDS[d.ui],period:"2026-08",
    orderCount:d.orders,totalSpent:d.spent,avgOrderValue:d.avg,
    lastOrderDate:isoPast(10),repeatPurchase:d.orders>1,npsScore:d.nps,
    churnRiskPercent:d.churn,repurchaseInterval:45,createdAt:isoPast(5),updatedAt:isoPast(1)}));
  return toCsv(H,R);
}

function legalPages() {
  const H = ["id","type","content","createdAt","updatedAt"];
  const pages = [
    {type:"TERMS_OF_USE",content:"# Terms of Use\n\nWelcome to WabiSaviArt. By using our platform you agree to these Terms of Use.\n\n## 1. Marketplace Rules\nWabiSaviArt is a marketplace connecting independent makers with buyers. All sellers must list only handmade, vintage, or craft-supply items.\n\n## 2. Buyer Responsibilities\nBuyers agree to provide accurate shipping information and pay for orders promptly.\n\n## 3. Seller Responsibilities\nSellers must accurately describe their items, ship orders within their stated processing times, and maintain a high standard of customer service.\n\n## 4. Prohibited Items\nCounterfeit goods, mass-produced items, and illegal items are strictly prohibited.\n\n## 5. Dispute Resolution\nIn case of disputes, WabiSaviArt offers a mediation service. We reserve the right to make final decisions.\n\n*Last updated: September 2026*"},
    {type:"PRIVACY_POLICY",content:"# Privacy Policy\n\nYour privacy is important to us at WabiSaviArt.\n\n## 1. Information We Collect\nWe collect information you provide (name, email, address) and data about your use of our platform.\n\n## 2. How We Use Your Information\nWe use your data to facilitate transactions, personalise your experience, and send important notifications.\n\n## 3. Data Sharing\nWe do not sell your personal data. We share information only with service providers necessary to operate the platform.\n\n## 4. Cookies\nWe use cookies to keep you logged in and to analyse platform usage.\n\n## 5. Your Rights\nYou have the right to access, correct, or delete your personal data at any time from your account settings.\n\n*Last updated: September 2026*"},
    {type:"COOKIE_POLICY",content:"# Cookie Policy\n\nWabiSaviArt uses cookies and similar technologies to improve your browsing experience.\n\n## What Are Cookies?\nCookies are small text files placed on your device when you visit our website.\n\n## Types of Cookies We Use\n- Essential Cookies: Required for authentication and security.\n- Analytics Cookies: Help us understand how visitors use the site.\n- Preference Cookies: Remember your settings and preferences.\n\n## Managing Cookies\nYou can control cookie settings through your browser.\n\n*Last updated: September 2026*"}
  ];
  const R = pages.map(p => ({id:uuid(),type:p.type,content:p.content,createdAt:isoPast(90),updatedAt:isoPast(5)}));
  return toCsv(H,R);
}

function faqData() {
  const catH = ["id","name","order","createdAt","updatedAt"];
  const catIds = [uuid(),uuid(),uuid(),uuid()];
  const cats = [
    {name:"Orders & Shipping",order:1},
    {name:"Returns & Refunds",order:2},
    {name:"Payments",order:3},
    {name:"Selling on WabiSaviArt",order:4}
  ];
  const catRows = cats.map((c,i) => ({id:catIds[i],name:c.name,order:c.order,createdAt:isoPast(80),updatedAt:isoPast(10)}));

  const qH = ["id","question","answer","order","categoryId","createdAt","updatedAt"];
  const qs = [
    {q:"How long does shipping take?",a:"Shipping times vary by seller and destination. Most sellers ship within 3-5 business days. Estimated delivery times are shown on each product listing.",order:1,ci:0},
    {q:"Can I track my order?",a:"Yes! Once your order is shipped you will receive a tracking number via email and it will be visible in your order history.",order:2,ci:0},
    {q:"Do sellers ship internationally?",a:"Many sellers offer international shipping, though not all. Check the shipping section on each product listing to confirm.",order:3,ci:0},
    {q:"What is the return policy?",a:"Most sellers accept returns within 30 days of delivery, provided items are unused and in their original condition. Check each seller's specific policy.",order:1,ci:1},
    {q:"How do I request a refund?",a:"To request a refund, go to your order in My Orders, click Request Refund, and follow the steps. The seller will review your request within 48 hours.",order:2,ci:1},
    {q:"What payment methods are accepted?",a:"We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe.",order:1,ci:2},
    {q:"Is my payment information secure?",a:"Yes. All payments are processed by Stripe, a PCI DSS Level 1 certified provider. We never store your card details on our servers.",order:2,ci:2},
    {q:"How do I become a seller?",a:"Click Start Selling in the navigation menu, complete the shop setup form, and submit for review. Our team typically reviews applications within 3-5 business days.",order:1,ci:3},
    {q:"What are the seller fees?",a:"WabiSaviArt charges a 5% platform fee on each sale plus standard payment processing fees (2.9% + $0.30 per transaction).",order:2,ci:3}
  ];
  const qRows = qs.map(q => ({id:uuid(),question:q.q,answer:q.a,order:q.order,categoryId:catIds[q.ci],createdAt:isoPast(80),updatedAt:isoPast(10)}));

  return { catCsv: toCsv(catH,catRows), qCsv: toCsv(qH,qRows) };
}

function banners() {
  const H = ["id","title","subtitle","imageUrl","background","isActive","sortOrder","createdAt","updatedAt"];
  const defs = [
    {title:"Discover Handmade Treasures",sub:"Unique items crafted with love by independent makers",bg:"linear-gradient(135deg, #2D4A3E 0%, #5C8374 100%)",order:1},
    {title:"Summer Sale - Up to 30% Off",sub:"Limited time offers on select woodcraft and ceramics",bg:"linear-gradient(135deg, #7B3F00 0%, #D2691E 100%)",order:2},
    {title:"New Arrivals This Week",sub:"Fresh handmade pieces from our top makers",bg:"linear-gradient(135deg, #1A237E 0%, #4FC3F7 100%)",order:3}
  ];
  const R = defs.map(b => ({id:uuid(),title:b.title,subtitle:b.sub,imageUrl:"placeholders/image-placeholder.png",background:b.bg,isActive:true,sortOrder:b.order,createdAt:isoPast(60),updatedAt:isoPast(5)}));
  return toCsv(H,R);
}

function platformFeeSettings() {
  const H = ["id","key","platformFeePercent","paymentProcessingPercent","paymentProcessingFlat","notes","createdAt","updatedAt"];
  return toCsv(H,[{id:uuid(),key:"default",platformFeePercent:5.00,paymentProcessingPercent:2.90,paymentProcessingFlat:0.30,notes:"Standard platform fee for all transactions",createdAt:isoPast(180),updatedAt:isoPast(30)}]);
}

function globalFreeShipping() {
  const H = ["id","sellerId","isEnabled","minimumOrderAmount","triggerCount","updatedAt"];
  return toCsv(H, S_PROF.map((sellerId,i) => ({id:uuid(),sellerId,isEnabled:i===0,minimumOrderAmount:i===0?100:0,triggerCount:i===0?12:0,updatedAt:isoPast(5)})));
}

function wishlistAutoCoupon() {
  const H = ["id","sellerId","isEnabled","discountPercentage","validityDays","sendEmailNotification","autoApplyAtCheckout","updatedAt"];
  return toCsv(H, S_PROF.map((sellerId,i) => ({id:uuid(),sellerId,isEnabled:i<2,discountPercentage:i===0?10:5,validityDays:30,sendEmailNotification:true,autoApplyAtCheckout:i===0,updatedAt:isoPast(10)})));
}

// ─── ZIP builder ──────────────────────────────────────────────────────────────

const OUT = path.join((import.meta as any).dir, "wabisaviart-demo.zip");

async function main() {
  console.log("🏗️  Building demo data CSVs…");
  const faq = faqData();

  const files: {name:string;csv:string}[] = [
    {name:"User.csv",             csv:users()},
    {name:"SellerProfile.csv",    csv:sellerProfiles()},
    {name:"Category.csv",         csv:categories()},
    {name:"SubCategory.csv",      csv:subCategories()},
    {name:"Promotion.csv",        csv:promotions()},
    {name:"Product.csv",          csv:products()},
    {name:"ProductVariant.csv",   csv:productVariants()},
    {name:"Address.csv",          csv:addresses()},
    {name:"Coupon.csv",           csv:coupons()},
    {name:"Order.csv",            csv:orders()},
    {name:"OrderItem.csv",        csv:orderItems()},
    {name:"OrderStatusHistory.csv",csv:orderStatusHistories()},
    {name:"PaymentMethod.csv",    csv:paymentMethods()},
    {name:"PaymentTransaction.csv",csv:paymentTransactions()},
    {name:"Shipment.csv",         csv:shipments()},
    {name:"Review.csv",           csv:reviews()},
    {name:"Wishlist.csv",         csv:wishlists()},
    {name:"WishlistItem.csv",     csv:wishlistItems()},
    {name:"Cart.csv",             csv:carts()},
    {name:"CartItem.csv",         csv:cartItems()},
    {name:"Conversation.csv",     csv:conversations()},
    {name:"ChatMessage.csv",      csv:chatMessages()},
    {name:"Notification.csv",     csv:notifications()},
    {name:"SellerPayout.csv",     csv:sellerPayouts()},
    {name:"ShopJournal.csv",      csv:shopJournals()},
    {name:"SupportTicket.csv",    csv:supportTickets()},
    {name:"CustomerMetrics.csv",  csv:customerMetrics()},
    {name:"LegalPage.csv",        csv:legalPages()},
    {name:"FaqCategory.csv",      csv:faq.catCsv},
    {name:"FaqQuestion.csv",      csv:faq.qCsv},
    {name:"Banner.csv",           csv:banners()},
    {name:"PlatformFeeSetting.csv",csv:platformFeeSettings()},
    {name:"GlobalFreeShippingConfig.csv",csv:globalFreeShipping()},
    {name:"WishlistAutoCouponConfig.csv",csv:wishlistAutoCoupon()},
  ];

  console.log(`📦 Zipping ${files.length} CSV files → ${OUT}`);

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(OUT);
    const archive = archiver("zip", {zlib:{level:9}});
    output.on("close", () => { console.log(`✅ ${archive.pointer()} bytes`); resolve(); });
    archive.on("error", reject);
    archive.pipe(output);
    for (const f of files) archive.append(f.csv, {name:f.name});
    archive.finalize();
  });

  console.log(`\n🎉  Backup file ready: demo-data/wabisaviart-demo.zip`);
  console.log("\n📋 Demo Credentials (password: Demo@123456):");
  console.log("   Admin:      admin@wabisaviart.com");
  console.log("   Seller 1:   seller1@demo.com  (Emma Woodcraft — EmmaWoodcraft shop)");
  console.log("   Seller 2:   seller2@demo.com  (Liam Pottery   — LiamCeramics shop)");
  console.log("   Seller 3:   seller3@demo.com  (Sofia Textiles — SofiaTextiles shop)");
  console.log("   Customer 1: customer1@demo.com (Alice Johnson)");
  console.log("   Customer 2: customer2@demo.com (Bob Martinez)");
  console.log("\nUpload at: Admin Dashboard → Settings → Backup & Restore → Restore Backup");
}

main().catch(err => { console.error("❌", err); process.exit(1); });
