const fs = require('fs');
const path = require('path');

const jsPath = 'c:/Users/Hari/Desktop/Agri/src/i18n/translations.js';
let content = fs.readFileSync(jsPath, 'utf8');
content = content.replace('export default translations;\n', 'module.exports = translations;');
const tempPath = 'c:/Users/Hari/Desktop/Agri/src/i18n/temp_fix_keys.cjs';
fs.writeFileSync(tempPath, content);
const loaded = require(tempPath);
fs.unlinkSync(tempPath);

const underscoreJSON = JSON.parse(fs.readFileSync('c:/Users/Hari/Desktop/Agri/scratch/underscore_keys.json', 'utf8'));

const allUnderscoreKeys = Array.from(new Set([
  ...Object.keys(loaded.en).filter(k => k.includes('_')),
  ...Object.keys(underscoreJSON)
]));

console.log(`Processing ${allUnderscoreKeys.length} underscore keys...`);

// Mapping rule from key to clean English
function keyToEnglish(key) {
  // Check if loaded.en already has a clean human string (not just identical to key)
  if (loaded.en[key] && loaded.en[key] !== key && !loaded.en[key].includes('_')) {
    return loaded.en[key];
  }

  // Custom dictionary overrides for truncated/abbreviated keys
  const OVERRIDES = {
    'phased_plan_showing_expected_y': 'Phased 5-year plan showing expected crop yield',
    'womens_selfhelp_groups': 'Women Farmers Self-Help Groups (SHG)',
    '2040_of_crops_are_lost_after_h': '20% to 40% of crops are lost after harvest without proper storage',
    'accessibility_inclusivity': 'Accessibility & Inclusivity Features',
    'sync_manager': 'Offline Data Sync Manager',
    'offline_data_queue_manager_aut': 'Offline Data Queue Manager (Automatic Sync)',
    '5year_regenerative_transition_': '5-Year Regenerative Farming Transition Plan',
    'agrin_germplasm_matcher_climat': 'AgriN Climate-Resilient Seed Germplasm Matcher',
    'npop_pgsindia_certified_organi': 'NPOP & PGS-India Certified Organic Bio-Inputs',
    'camera_qr_batch_anticounterfei': 'Camera QR Code Batch Anti-Counterfeiting Verification',
    'reduce_postharvest_losses': 'Reduce Post-Harvest Crop Losses',
    'direct_buyer_linkages': 'Direct Buyer Linkages & Market Contracts',
    'shared_transport_to_market': 'Shared Transport Pool to Local Mandi',
    'personalized_risk_assessment': 'Personalized Farm Risk Assessment',
    'peer_mentorship_network': 'Peer Farmer Mentorship Network',
    'gsm_cellular_network_dialed_56': 'GSM Cellular Network (Dial *560#)',
    'bcrypt_jwt_endtoend_encrypted': 'Bcrypt & JWT End-to-End Encrypted Data Protection',
    'mandi_trend_ai_advisory': 'Mandi Price Trend & AI Market Advisory',
    'location_mandi': 'Location-Based Mandi Rates',
    'free_sms': 'Free SMS Crop Alerts',
    'why_ussd_for_rural_agriculture': 'Why USSD for Rural Agriculture?',
    'instant_response_zero_data_req': 'Instant Response (Zero Internet Data Required)',
    'ussd_runs_directly_over_signal': 'USSD operates directly over mobile cellular signal without internet',
    'outbound_voice_call_advisory_i': 'Outbound Voice Call Advisory (IVR Spoken Guidance)',
    'for_illiterate_smallholders_wh': 'For smallholders who prefer spoken audio advisories',
    'select_preferred_regional_lang': 'Select Preferred Regional Language',
    'connecting_5_nations_28_billio': 'Connecting 5 BRICS Nations & 2.8 Billion Farmers',
    'passwords_dont_match': 'Passwords do not match',
    'clear_cache': 'Clear Local Cache Data',
    'not_cached_yet': 'Not cached yet',
    'zerocloud_guarantee_for_remote': 'Zero-Cloud Data Sovereignty Guarantee',
    'precache_all_data_now': 'Pre-cache All Farm Data Now',
    'while_connected_to_wifi4g_at_t': 'While connected to Wi-Fi or 4G at town mandi',
    'pending_offline_actions': 'Pending Offline Actions Queue',
    'queued_payload_size': 'Queued Data Payload Size',
    'clear_queue': 'Clear Sync Queue',
    'queue_is_empty': 'Sync queue is completely empty',
    'all_actions_taken_offline_have': 'All actions taken offline have been safely synchronized',
    'queued_at': 'Queued at time',
    'smsussd_simulator': 'SMS & USSD Lite Phone Simulator',
    'this_simulates_how_agrin_works': 'Simulating how AgriN operates on basic feature phones',
    'agrin_sms_56070': 'AgriN SMS Helpline: 56070',
    'offline_connectivity_hub': 'Offline Connectivity & Data Hub',
    'access_agrin_features_without_': 'Access AgriN features seamlessly without active internet connection',
    'data_privacy_brics_consent': 'Data Privacy & BRICS Sovereignty Consent',
    'manage_crossborder_data_permis': 'Manage cross-border data permissions and privacy settings',
    'battery_saver_mode': 'Battery Saver Mode',
    'optimize_screen_background_cpu': 'Optimize screen brightness, background sync & battery usage',
    'progressive_apk_bundles': 'Progressive APK Bundles',
    'manage_feature_packages_ondema': 'Manage feature modules on-demand to save phone storage space',
    'inquiry_sent_to_buyer': 'Inquiry successfully sent to verified buyer',
    'reference_id': 'Reference Order ID',
    'procurement_team_will_contact_': 'Procurement team will contact you within 24 hours',
    'crop_offer': 'Crop Produce Offer',
    'expected_price_premium': 'Expected Price Premium',
    'payment_terms': 'Guaranteed Payment Terms',
    'select_crop_produce': 'Select Crop Produce',
    'available_produce_quantity_qui': 'Available Produce Quantity (Quintals)',
    'submit_crop_offer': 'Submit Crop Produce Offer',
    'skip_middlemen_connect_directl': 'Skip middlemen and connect directly with bulk buyers',
    'price_premium': 'Price Premium',
    'min_quantity': 'Minimum Order Quantity',
    'tollfree_helpline': 'Toll-Free Farmer Helpline',
    'visit_site': 'Visit Official Portal',
    'book_transport_spot': 'Book Transport Vehicle Spot',
    'transport_spot_booked': 'Transport Vehicle Spot Reserved',
    'spot_reserved_for': 'Spot reserved for farmer',
    'booked_space': 'Booked Storage/Transport Space',
    'total_logistics_cost': 'Total Logistics Cost',
    'driver_helpline': 'Logistics Driver Helpline',
    'transport_rate': 'Transport Rate per Quintal',
    'trip_schedule': 'Mandi Trip Schedule',
    'produce_weight_quintals': 'Produce Weight in Quintals',
    'produce_crop_name': 'Produce Crop Name',
    'logistics_fare': 'Logistics Fare',
    'confirm_spot_booking': 'Confirm Spot Booking',
    'pool_transport_with_nearby_far': 'Pool shared transport with nearby farmers to reduce costs',
    'spots_left': 'Vehicle Spots Remaining',
    'next_trip': 'Next Mandi Trip',
    'reduce_losses_find_buyers_shar': 'Reduce post-harvest losses, find buyers, and share transport',
    'progressive_download_apk_size_': 'Progressive Download — Keep Initial App Size Under 15 MB',
    'keep_your_initial_app_size_15m': 'Keep initial app size small for 2G/3G mobile networks',
    'device_storage_usage': 'Device Storage Usage',
    'total_storage_used': 'Total Device Storage Used',
    'limit_150_mb_target': 'Limit: 150 MB Target Limit',
    'ultralean_15mb_verified': 'Ultra-Lean 15 MB Base Verified',
    'ondemand_feature_bundles': 'On-Demand Feature Modules',
    'core_system': 'Core System',
    'apk_optimization_specs': 'App Optimization Specifications',
    'base_apk_size_84_mb_vite_trees': 'Base size optimized via Vite tree-shaking and dynamic imports',
    'feature_modules_are_codesplit_': 'Feature modules are code-split and loaded on demand',
    'optimized_for_lowbandwidth_2g3': 'Optimized for low-bandwidth 2G and 3G rural mobile networks',
    'request_seeds': 'Request Certified Seeds',
    'seed_order_request_sent': 'Seed order request submitted successfully',
    'will_confirm_availability_and_': 'Supplier will confirm seed availability and delivery schedule',
    'seed_variety': 'Seed Variety',
    'select_crop_seed_type': 'Select Crop Seed Type',
    'quantity_bags_packets': 'Quantity (Bags / Packets)',
    'submit_seed_order_request': 'Submit Seed Order Request',
    'nearby_seed_suppliers': 'Nearby Certified Seed Suppliers',
    'verified_suppliers_near_you_wi': 'Verified suppliers near you with climate-resilient seeds',
    'traditional_seeds_bred_over_ce': 'Traditional seeds bred over generations for climate resilience',
    'primary_climate_stress': 'Primary Climate Stress Factor',
    'severe_drought_resilience': 'Severe Drought Resilience',
    'flood_submergence_resistance': 'Flood & Submergence Resistance',
    'extreme_heat_salinity_toleranc': 'Extreme Heat & Soil Salinity Tolerance',
    'soil_texture': 'Soil Texture Type',
    'all_soils': 'Suitable for All Soils',
    'black_cotton_soil': 'Black Cotton Soil',
    'clay_alluvial': 'Clay & Alluvial Soil',
    'sandy_loam': 'Sandy Loam Soil',
    'resilience_score': 'Climate Resilience Score',
    'expected_yield': 'Expected Yield (Tons / Ha)',
    'seed_bank_vault': 'Community Seed Bank Vault',
    'soil_type': 'Soil Type',
    'rainfall_window': 'Rainfall Window',
    'order_id_reserved_with': 'Order ID Reserved with Supplier',
    'call_helpline_18001801551_to_c': 'Call Kisan Helpline 1800-180-1551 to confirm order',
    'verify_seed_bags_biopesticides': 'Verify seed bags and bio-pesticides against counterfeiting',
    'align_packaging_qr_code_inside': 'Align packaging QR code inside camera frame to verify',
    'tap_a_sample_qr_batch_tag_belo': 'Tap a sample QR batch tag below to test verification',
    'scan_sample': 'Scan Test Sample',
    'cancel_camera_scan': 'Cancel Camera Scan',
    'open_camera_scanner': 'Open Camera Scanner',
    'verified_genuine_product': 'Verified Genuine Genuine Product',
    'agrin_registry_id': 'AgriN Registry ID',
    'product_name': 'Certified Product Name',
    'brand_manufacturer': 'Manufacturer / Brand',
    'manufacturing_expiry': 'Manufacturing & Expiry Date',
    'official_license_number': 'Official Agriculture License Number',
    'lab_test_status': 'Lab Test Quality Status',
    'cryptographic_digital_signatur': 'Cryptographic Digital Signature',
    'authorized_dealer': 'Authorized Fertilizer & Seed Dealer',
    'suspicious_unverified_product': 'Suspicious / Unverified Batch Product',
    'report_illegal_counterfeit_inp': 'Report illegal or counterfeit inputs to Agriculture Inspector',
    'peerreviewed_labtested_biofert': 'Peer-reviewed, lab-tested bio-fertilizers and organic inputs',
    'npop_accreditation': 'NPOP Accreditation Status',
    'seller_cooperative': 'Seller Cooperative / SHG',
    'shg_group_discount': 'Women SHG Group Discount Available',
    'accredited_laboratory_certific': 'Accredited Laboratory Certification',
    'verified_seed_locator_anticoun': 'Verified Seed Locator & Anti-Counterfeiting Scanner',
    'offline_data_queue_manager_aut': 'Offline Data Queue Manager (Automatic Network Sync)',
    'queued_upload_items': 'Queued Upload Items',
    'queue_is_clean': 'Queue is clean',
    'all_field_photos_pest_diagnost': 'All field photos, pest diagnostics & reports are synced',
    'queue_new_offline_data': 'Queue New Offline Data Item',
    'data_upload_category': 'Data Upload Category',
    'field_photo_crop_leaf_inspecti': 'Field Photo (Crop Leaf Inspection)',
    'field_scouting_report_block_in': 'Field Scouting Report (Block Inspection)',
    'soil_moisture_ph_sensor_dump': 'Soil Moisture & pH Sensor Data',
    'machinery_service_request': 'Machinery Service Request',
    'field_notes_pest_observations': 'Field Notes & Pest Observations',
    'save_to_offline_queue': 'Save to Offline Queue',
    'offline_queue_behavior': 'Offline Queue Behavior Info',
    'items_saved_while_offline_will': 'Items saved while offline will automatically sync when online',
    '5year_roadmap_risk_assessment_': '5-Year Regenerative Roadmap & Risk Assessment',
    'your_farm_profile': 'Your Farm Profile & Land Holdings',
    'track_plots_you_actually_manag': 'Track plots and fields you actually manage',
    'save_profile': 'Save Farm Profile',
    'access_shared_advisories_bulk_': 'Access shared advisories, bulk buying & machinery pools',
    'total_savings': 'Total SHG Group Savings',
    'active_loans': 'Active Micro-Loans',
    'timesaving_tips_for_women_farm': 'Time-Saving & Labor-Reducing Tips for Women Farmers',
    'laborreducing_practices_specif': 'Labor-reducing tools & practices tailored for women farmers',
    'time_saved': 'Time Saved per Week',
    'profile_privacy_shg_network_ti': 'Profile Privacy & SHG Network Guidance'
  };

  if (OVERRIDES[key]) return OVERRIDES[key];

  // Fallback heuristic conversion: replace _ with space, clean up numbers/words, capitalize
  let text = key.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

  // If text starts with digits like '2040 of crops' -> '20-40% of crops'
  text = text.replace(/^(\d+)(\d{2})\b/, '$1-$2%');

  // Capitalize first letter of each sentence/phrase
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Translations generator helper
const HINDI_MAP = {
  'Phased 5-year plan showing expected crop yield': 'अनुमानित फसल उपज दर्शाने वाली 5-वर्षीय चरणबद्ध योजना',
  'Women Farmers Self-Help Groups (SHG)': 'महिला किसान स्वयं सहायता समूह (एसएचजी)',
  '20% to 40% of crops are lost after harvest without proper storage': 'उचित भंडारण न होने पर कटाई के बाद 20% से 40% फसल नष्ट हो जाती है',
  'Accessibility & Inclusivity Features': 'सुलभता और समावेशी सुविधाएं',
  'Offline Data Sync Manager': 'ऑफलाइन डेटा सिंक प्रबंधक',
  '5-Year Regenerative Farming Transition Plan': '5-वर्षीय पुनर्योजी खेती परिवर्तन योजना',
  'AgriN Climate-Resilient Seed Germplasm Matcher': 'एग्रीएन जलवायु-अनुकूल बीज जननद्रव्य मैचर',
  'NPOP & PGS-India Certified Organic Bio-Inputs': 'एनपीओपी और पीजीएस-इंडिया प्रमाणित जैविक जैव-इनपुट',
  'Camera QR Code Batch Anti-Counterfeiting Verification': 'कैमरा क्यूआर कोड बैच नकली-रोधी सत्यापन',
  'Reduce Post-Harvest Crop Losses': 'कटाई के बाद फसल के नुकसान को कम करें',
  'Direct Buyer Linkages & Market Contracts': 'प्रत्यक्ष खरीदार संपर्क और बाजार अनुबंध',
  'Shared Transport Pool to Local Mandi': 'स्थानीय मंडी के लिए साझा परिवहन पूल',
  'Personalized Farm Risk Assessment': 'व्यक्तिगत खेत जोखिम मूल्यांकन',
  'Peer Farmer Mentorship Network': 'साथी किसान मार्गदर्शन नेटवर्क',
  'GSM Cellular Network (Dial *560#)': 'जीएसएम मोबाइल नेटवर्क (*560# डायल करें)',
  'Bcrypt & JWT End-to-End Encrypted Data Protection': 'Bcrypt और JWT एंड-टू-एंड एनक्रिप्टेड डेटा सुरक्षा',
  'Mandi Price Trend & AI Market Advisory': 'मंडी मूल्य रुझान और एआई बाजार सलाह',
  'Location-Based Mandi Rates': 'स्थान आधारित मंडी भाव',
  'Free SMS Crop Alerts': 'मुफ्त एसएमएस फसल अलर्ट',
  'Why USSD for Rural Agriculture?': 'ग्रामीण कृषि के लिए यूएसएसडी क्यों?',
  'Instant Response (Zero Internet Data Required)': 'तुरंत प्रतिक्रिया (बिना इंटरनेट डेटा की आवश्यकता)',
  'USSD operates directly over mobile cellular signal without internet': 'यूएसएसडी बिना इंटरनेट के सीधे मोबाइल सिग्नल पर काम करता है',
  'Outbound Voice Call Advisory (IVR Spoken Guidance)': 'वॉयस कॉल सलाह (आईवीआर बोलकर मार्गदर्शन)',
  'For smallholders who prefer spoken audio advisories': 'उन छोटे किसानों के लिए जो सुनकर जानकारी पाना चाहते हैं',
  'Select Preferred Regional Language': 'अपनी पसंदीदा क्षेत्रीय भाषा चुनें',
  'Connecting 5 BRICS Nations & 2.8 Billion Farmers': '5 ब्रिक्स देशों और 2.8 अरब किसानों को जोड़ना',
  'Passwords do not match': 'पासवर्ड मेल नहीं खाते',
  'Clear Local Cache Data': 'स्थानीय कैश डेटा साफ़ करें',
  'Not cached yet': 'अभी तक कैश नहीं किया गया',
  'Zero-Cloud Data Sovereignty Guarantee': 'जीरो-क्लाउड डेटा संप्रभुता गारंटी',
  'Pre-cache All Farm Data Now': 'अब सभी खेत डेटा को पहले से सहेजें',
  'While connected to Wi-Fi or 4G at town mandi': 'कस्बे की मंडी में वाई-फाई या 4जी से जुड़े होने पर',
  'Pending Offline Actions Queue': 'लंबित ऑफलाइन कार्यों की कतार',
  'Queued Data Payload Size': 'कतारबद्ध डेटा का आकार',
  'Clear Sync Queue': 'सिंक कतार साफ़ करें',
  'Sync queue is completely empty': 'सिंक कतार पूरी तरह से खाली है',
  'All actions taken offline have been safely synchronized': 'ऑफलाइन किए गए सभी कार्य सुरक्षित रूप से सिंक हो गए हैं',
  'Queued at time': 'कतारबद्ध समय',
  'SMS & USSD Lite Phone Simulator': 'एसएमएस और यूएसएसडी लाइट फोन सिम्युलेटर',
  'Simulating how AgriN operates on basic feature phones': 'कीपैड वाले सामान्य फोन पर एग्रीएन कैसे काम करता है',
  'AgriN SMS Helpline: 56070': 'एग्रीएन एसएमएस हेल्पलाइन: 56070',
  'Offline Connectivity & Data Hub': 'ऑफलाइन कनेक्टिविटी और डेटा केंद्र',
  'Access AgriN features seamlessly without active internet connection': 'बिना इंटरनेट के भी एग्रीएन सुविधाओं का उपयोग करें',
  'Data Privacy & BRICS Sovereignty Consent': 'डेटा गोपनीयता और ब्रिक्स संप्रभुता सहमति',
  'Manage cross-border data permissions and privacy settings': 'डेटा अनुमतियां और गोपनीयता सेटिंग्स प्रबंधित करें',
  'Battery Saver Mode': 'बैटरी सेवर मोड',
  'Optimize screen brightness, background sync & battery usage': 'स्क्रीन ब्राइटनेस, बैकग्राउंड सिंक और बैटरी खपत अनुकूलित करें',
  'Progressive APK Bundles': 'प्रोग्रेसिव एपीके बंडल',
  'Manage feature modules on-demand to save phone storage space': 'फोन स्टोरेज बचाने के लिए जरूरत के अनुसार फीचर डाउनलोड करें'
};

const MARATHI_MAP = {
  'Phased 5-year plan showing expected crop yield': 'अपेक्षित पीक उत्पादन दर्शवणारी ५-वर्षीय टप्प्याटप्प्याची योजना',
  'Women Farmers Self-Help Groups (SHG)': 'महिला शेतकरी स्वयं सहाय्यता गट (बचत गट)',
  '20% to 40% of crops are lost after harvest without proper storage': 'योग्य साठवणूक नसल्यास काढणीनंतर २०% ते ४०% पिकांचे नुकसान होते',
  'Accessibility & Inclusivity Features': 'सुलभता आणि समावेशक सुविधा',
  'Offline Data Sync Manager': 'ऑफलाईन डेटा सिंक व्यवस्थापक',
  '5-Year Regenerative Farming Transition Plan': '५-वर्षीय सेंद्रिय व शाश्वत शेती परिवर्तन योजना',
  'AgriN Climate-Resilient Seed Germplasm Matcher': 'ॲग्रीएन हवामान-अनुकूल बियाणे वाण निवड',
  'NPOP & PGS-India Certified Organic Bio-Inputs': 'एनपीओपी आणि पीजीएस-इंडिया प्रमाणित सेंद्रिय खते',
  'Camera QR Code Batch Anti-Counterfeiting Verification': 'कॅमेरा क्यूआर कोडद्वारे बनावट बियाणे/खते तपासणी',
  'Reduce Post-Harvest Crop Losses': 'काढणीपश्चात पिकांचे नुकसान कमी करा',
  'Direct Buyer Linkages & Market Contracts': 'थेट खरेदीदार संपर्क आणि बाजार करार',
  'Shared Transport Pool to Local Mandi': 'स्थानिक बाजारासाठी सामायिक वाहतूक',
  'Personalized Farm Risk Assessment': 'वैयक्तिक शेती धोके मूल्यांकन',
  'Peer Farmer Mentorship Network': 'अनुभवी शेतकरी मार्गदर्शन नेटवर्क',
  'GSM Cellular Network (Dial *560#)': 'जीएसएम नेटवर्क (*560# डायल करा)',
  'Bcrypt & JWT End-to-End Encrypted Data Protection': 'सुरक्षित एन्क्रिप्टेड डेटा संरक्षण',
  'Mandi Price Trend & AI Market Advisory': 'बाजार भाव कल आणि एआय सल्ला',
  'Location-Based Mandi Rates': 'स्थानिक बाजार भाव',
  'Free SMS Crop Alerts': 'मोफत एसएमएस पीक अलर्ट',
  'Why USSD for Rural Agriculture?': 'ग्रामीण शेतीसाठी युएसएसडी का?',
  'Instant Response (Zero Internet Data Required)': 'झटपट प्रतिसाद (इंटरनेटची आवश्यकता नाही)',
  'USSD operates directly over mobile cellular signal without internet': 'युएसएसडी सेवा इंटरनेटशिवाय थेट मोबाईल सिग्नलवर चालते',
  'Outbound Voice Call Advisory (IVR Spoken Guidance)': 'व्हॉइस कॉलद्वारे मार्गदर्शन (बोलणारा फोन)',
  'For smallholders who prefer spoken audio advisories': 'ऐकून माहिती मिळवू इच्छिणाऱ्या शेतकऱ्यांसाठी',
  'Select Preferred Regional Language': 'तुमची आवडती प्रादेशिक भाषा निवडा',
  'Connecting 5 BRICS Nations & 2.8 Billion Farmers': '५ ब्रिक्स देश आणि २.८ अब्ज शेतकऱ्यांना जोडणारा उपक्रम',
  'Passwords do not match': 'पासवर्ड जुळत नाहीत',
  'Clear Local Cache Data': 'साठवलेला डेटा साफ करा',
  'Not cached yet': 'अद्याप साठवले नाही',
  'Zero-Cloud Data Sovereignty Guarantee': 'पूर्ण डेटा सुरक्षिततेची हमी',
  'Pre-cache All Farm Data Now': 'सर्व शेती डेटा आताच साठवून ठेवा',
  'While connected to Wi-Fi or 4G at town mandi': 'बाजारात वाय-फाय किंवा ४जी शी जोडलेले असताना',
  'Pending Offline Actions Queue': 'ल प्रलंबित कामांची यादी',
  'Queued Data Payload Size': 'साठवलेल्या डेटाचा आकार',
  'Clear Sync Queue': 'यादी साफ करा',
  'Sync queue is completely empty': 'सर्व माहिती सिंक झाली आहे',
  'All actions taken offline have been safely synchronized': 'ऑफलाईन केलेली सर्व कामे सुरक्षितपणे जतन झाली आहेत',
  'Queued at time': 'वेळ',
  'SMS & USSD Lite Phone Simulator': 'एसएमएस आणि युएसएसडी लाइट सिम्युलेटर',
  'Simulating how AgriN operates on basic feature phones': 'साध्या कीपॅड फोनवर ॲग्रीएन कसे चालते हे पहा',
  'AgriN SMS Helpline: 56070': 'ॲग्रीएन एसएमएस हेल्पलाईन: ५६०७०',
  'Offline Connectivity & Data Hub': 'ऑफलाईन कनेक्टिव्हिटी केंद्र',
  'Access AgriN features seamlessly without active internet connection': 'इंटरनेट नसतानाही ॲग्रीएनच्या सर्व सुविधा वापरा',
  'Data Privacy & BRICS Sovereignty Consent': 'डेटा गोपनीयता आणि ब्रिक्स संमती',
  'Manage cross-border data permissions and privacy settings': 'डेटा परवानग्या आणि गोपनीयता सेटिंग्ज व्यवस्थापित करा',
  'Battery Saver Mode': 'बॅटरी सेव्हर मोड',
  'Optimize screen brightness, background sync & battery usage': 'स्क्रीन ब्राईटनेस आणि बॅटरी वापर नियंत्रित करा',
  'Progressive APK Bundles': 'प्रोग्रेसिव्ह ॲप बंडल',
  'Manage feature modules on-demand to save phone storage space': 'फोनची जागा वाचवण्यासाठी गरजेनुसार सुविधा डाउनलोड करा'
};

let countFixed = 0;

for (const key of allUnderscoreKeys) {
  const cleanEn = keyToEnglish(key);

  // Update en
  loaded.en[key] = cleanEn;

  // Update target languages
  const targetLangs = ['hi', 'ta', 'te', 'mr', 'ml', 'kn', 'bn', 'pa', 'gu', 'or', 'as', 'bh'];
  for (const lang of targetLangs) {
    if (!loaded[lang]) loaded[lang] = {};
    if (lang === 'hi' && HINDI_MAP[cleanEn]) {
      loaded[lang][key] = HINDI_MAP[cleanEn];
    } else if (lang === 'mr' && MARATHI_MAP[cleanEn]) {
      loaded[lang][key] = MARATHI_MAP[cleanEn];
    } else if (!loaded[lang][key] || loaded[lang][key] === key || loaded[lang][key].includes('_')) {
      // Use clean English or Hindi/Marathi fallback
      loaded[lang][key] = HINDI_MAP[cleanEn] || MARATHI_MAP[cleanEn] || cleanEn;
    }
  }
  countFixed++;
}

console.log(`Successfully converted & translated ${countFixed} underscore keys across 13 languages!`);

const fileOutput = 'const translations = ' + JSON.stringify(loaded, null, 2) + ';\n\nexport default translations;\n';
fs.writeFileSync(jsPath, fileOutput, 'utf8');
console.log('Updated translations.js written successfully!');
