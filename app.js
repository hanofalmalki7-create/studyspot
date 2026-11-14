// ===================== 1) البيانات =====================
var hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; // ساعات بداية الحجز: من 8 الصبح إلى 7 المساء
// كل مكان له: id رقمه، name اسمه، type نوعه، seats الكراسي، floor الطابق، building المبنى، facilities المرافق، rate التقييم، votes عدد المقيّمات
var spaces = [
  { id: 1, name: "Quiet Table 1", type: "Table", seats: 4, floor: 1, building: "Main Library", facilities: "Power outlets, Wi-Fi, silent zone", rate: 4.6, votes: 12 }, // طاولة هادئة 1
  { id: 2, name: "Quiet Table 2", type: "Table", seats: 4, floor: 1, building: "Main Library", facilities: "Power outlets, Wi-Fi, silent zone", rate: 4.4, votes: 9 }, // طاولة هادئة 2
  { id: 3, name: "Window Table 3", type: "Table", seats: 6, floor: 2, building: "Main Library", facilities: "Natural light, power outlets", rate: 4.8, votes: 15 }, // طاولة جنب الشباك
  { id: 4, name: "Group Table 4", type: "Table", seats: 8, floor: 2, building: "Main Library", facilities: "Whiteboard, power outlets", rate: 4.1, votes: 7 }, // طاولة جماعية
  { id: 5, name: "Study Room A", type: "Room", seats: 4, floor: 1, building: "Science Building", facilities: "Closed door, whiteboard, screen", rate: 4.5, votes: 11 }, // غرفة A
  { id: 6, name: "Study Room B", type: "Room", seats: 6, floor: 2, building: "Science Building", facilities: "Closed door, whiteboard, screen", rate: 4.3, votes: 8 }, // غرفة B
  { id: 7, name: "Study Room C", type: "Room", seats: 8, floor: 2, building: "Science Building", facilities: "Closed door, projector, whiteboard", rate: 4.7, votes: 10 }, // غرفة C
  { id: 8, name: "Project Room D", type: "Room", seats: 10, floor: 3, building: "Science Building", facilities: "Projector, whiteboard, screen", rate: 4.2, votes: 6 } // غرفة المشاريع D
];
var data = { user: "", bookings: [], seeded: false }; // بيانات الطالبة: رقمها الجامعي وحجوزاتها
try { // نحاول نقرأ البيانات المحفوظة من قبل
  var saved = localStorage.getItem("studyspot2"); // نجيب النص المحفوظ في المتصفح
  if (saved) { data = JSON.parse(saved); } // إذا فيه بيانات نحولها من نص إلى كائن
} catch (e) { } // إذا صار خطأ نكمل بدون ما نوقف البرنامج
if (!data.notifications) { data.notifications = []; } // قائمة الإشعارات (جديد)
if (!data.remindMin) { data.remindMin = 30; } // كم دقيقة قبل الحجز نذكّر الطالبة (الافتراضي 30)
if (data.name === undefined) { data.name = ""; } // اسم الطالبة في الملف الشخصي
function save() { // دالة تحفظ البيانات
  try { localStorage.setItem("studyspot2", JSON.stringify(data)); } catch (e) { } // نحول البيانات لنص ونحفظها في المتصفح
}

// ===================== 2) دوال مساعدة =====================
function safe(t) { // دالة تنظف النص عشان ما ينكتب فيه كود HTML
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); // نبدل الرموز الخطرة
}
function pad2(n) { // دالة تضيف صفر قبل الرقم الصغير
  return (n < 10 ? "0" : "") + n; // مثلاً 9 تصير 09
}
function hourText(h) { // دالة تحول الساعة لنص
  return pad2(h) + ":00"; // مثلاً 9 تصير 09:00
}
function dateKey(daysFromToday) { // دالة تعطي تاريخ اليوم أو بعده بصيغة سنة-شهر-يوم
  var d = new Date(); // تاريخ اليوم
  d.setDate(d.getDate() + daysFromToday); // نزيد عدد الأيام
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); // نركّب التاريخ
}
function dateLabel(key) { // دالة تحول التاريخ لنص يقرأه الإنسان
  var d = new Date(key + "T00:00"); // نحول النص إلى تاريخ
  return d.toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" }); // مثلاً Wed Oct 21
}
function startTime(b) { // دالة تعطي وقت بداية الحجز
  return new Date(b.day + "T" + hourText(b.hour)); // تاريخ الحجز مع ساعته
}
function endTime(b) { // دالة تعطي وقت نهاية الحجز
  return new Date(startTime(b).getTime() + b.length * 3600000); // نزيد عدد الساعات (الساعة = 3600000 ملي ثانية)
}
function findSpace(id) { // دالة تدور على مكان برقمه
  for (var i = 0; i < spaces.length; i++) { // نمر على كل الأماكن
    if (spaces[i].id == id) { return spaces[i]; } // إذا الرقم يطابق نرجع المكان
  }
}
function averageRating(space) { // دالة تحسب متوسط تقييم المكان
  var sum = space.rate * space.votes; // مجموع التقييمات الأساسية
  var count = space.votes; // عدد المقيّمات الأساسي
  for (var i = 0; i < data.bookings.length; i++) { // نمر على حجوزاتي
    var b = data.bookings[i]; // الحجز الحالي
    if (b.space == space.id && b.rating > 0) { sum += b.rating; count += 1; } // نضيف تقييمي لهذا المكان
  }
  return { avg: (sum / count).toFixed(1), count: count }; // نرجع المتوسط (رقم عشري واحد) والعدد
}

// ===================== 3) منطق الحجز =====================
function isBusy(id, day, h) { // هل هذي الساعة غير متاحة؟
  if (day == dateKey(0) && h <= new Date().getHours()) { return true; } // الساعة اللي مرت ما تنحجز
  var dayNumber = Number(day.slice(8)); // رقم اليوم من التاريخ
  if ((id * 7 + h * 3 + dayNumber * 5) % 6 == 0) { return true; } // أوقات محجوزة من طالبات ثانيات (للتجربة فقط)
  for (var i = 0; i < data.bookings.length; i++) { // نمر على حجوزاتي
    var b = data.bookings[i]; // الحجز الحالي
    if (!b.cancelled && b.space == id && b.day == day && h >= b.hour && h < b.hour + b.length) { return true; } // إذا حجزي يغطي هذي الساعة
  }
  return false; // غير كذا الساعة متاحة
}
function canBook(id, day, h, length) { // هل نقدر نحجز من الساعة h لمدة length؟
  if (h + length > 20) { return false; } // ما نحجز بعد الساعة 8 المساء
  for (var k = 0; k < length; k++) { // نفحص كل ساعة في المدة
    if (isBusy(id, day, h + k)) { return false; } // إذا ساعة وحدة مشغولة ما نقدر نحجز (يمنع الحجز المكرر)
  }
  return true; // كل الساعات متاحة
}
function upcomingBookings() { // دالة ترجع حجوزاتي القادمة
  var list = []; // قائمة فاضية
  for (var i = 0; i < data.bookings.length; i++) { // نمر على كل الحجوزات
    var b = data.bookings[i]; // الحجز الحالي
    if (!b.cancelled && endTime(b) > new Date()) { list.push(b); } // غير ملغي ولسا ما انتهى
  }
  list.sort(function (a, b) { return startTime(a) - startTime(b); }); // نرتبها من الأقرب
  return list; // نرجع القائمة
}
function reminderBox() { // مربع التذكير قبل الحجز بـ 30 دقيقة
  var list = upcomingBookings(); // حجوزاتي القادمة
  if (list.length == 0) { return ""; } // ما فيه حجز: ما نعرض تذكير
  var minutes = Math.round((startTime(list[0]) - new Date()) / 60000); // الدقائق المتبقية على أقرب حجز
  if (minutes >= 0 && minutes <= data.remindMin) { // إذا باقي الوقت اللي اختارته الطالبة أو أقل
    return '<div class="note">Reminder: your booking at ' + findSpace(list[0].space).name + ' starts in ' + minutes + ' min.</div>'; // نعرض التذكير
  }
  return ""; // غير كذا ما نعرض شي
}

function addNotification(text) { // دالة تضيف إشعار جديد (US-14)
  data.notifications.unshift({ id: Date.now() + Math.random(), text: text, time: new Date().toISOString(), read: false }); // نضيفه في أول القائمة
  save(); // نحفظ
}
function unreadCount() { // عدد الإشعارات اللي ما انقرأت
  var n = 0; // العداد يبدأ من صفر
  for (var i = 0; i < data.notifications.length; i++) { // نمر على كل الإشعارات
    if (!data.notifications[i].read) { n += 1; } // إذا ما انقرأ نزيد العداد
  }
  return n; // نرجع العدد
}
function checkReminders() { // دالة تفحص إذا حان وقت التذكير (US-07)
  var list = upcomingBookings(); // حجوزاتي القادمة
  for (var i = 0; i < list.length; i++) { // نمر عليها
    var minutes = Math.round((startTime(list[i]) - new Date()) / 60000); // الدقائق المتبقية على الحجز
    if (!list[i].reminded && minutes >= 0 && minutes <= data.remindMin) { // داخل وقت التذكير ولسا ما ذكرناها
      list[i].reminded = true; // نسجل إننا ذكرناها عشان ما تتكرر
      addNotification("Reminder: your booking at " + findSpace(list[i].space).name + " starts in " + minutes + " min."); // نضيف إشعار التذكير
    }
  }
}

// ===================== 4) حالة الشاشة =====================
var view = { page: data.user ? "list" : "login", tab: "up" }; // الشاشة الحالية: إذا مسجلة دخول نبدأ بالأماكن وإلا الدخول
var filters = { text: "", type: "", seats: 0, floor: "", sort: "" }; // قيم البحث والفلاتر والترتيب

if (!data.seeded) { // أول مرة تفتح التطبيق
  data.bookings.push({ id: 1, space: 1, day: dateKey(-1), hour: 10, length: 1, rating: 0, cancelled: false }); // نضيف حجز قديم (أمس) عشان تجربين التقييم
  data.seeded = true; // نسجل إننا أضفناه
  save(); // نحفظ
}

// ===================== 5) رسم الشاشات =====================
function topBar(backPage) { // الشريط اللي فوق: رجوع وتسجيل خروج
  var html = '<div class="top">'; // نفتح الشريط
  if (backPage) { html += '<button class="lnk" data-a="go" data-p="' + backPage + '">‹ Back</button>'; } else { html += "<span></span>"; } // زر الرجوع إذا فيه شاشة سابقة
  html += '<button class="lnk" data-a="out">Sign out</button></div>'; // زر تسجيل الخروج
  return html; // نرجع الشريط
}
function loginScreen() { // شاشة تسجيل الدخول
  var html = "<h1>Welcome to StudySpot</h1>"; // العنوان
  html += '<p class="mut">Sign in with your university account to find and book a place to study.</p>'; // شرح قصير
  html += '<label for="id">University ID</label><input id="id" placeholder="e.g. 442012345">'; // حقل الرقم الجامعي
  html += '<label for="pw">Password</label><input id="pw" type="password">'; // حقل كلمة المرور
  html += '<p class="err" id="er"></p>'; // مكان رسالة الخطأ
  html += '<button class="btn" data-a="login">Sign in</button>'; // زر الدخول
  return html; // نرجع الشاشة
}
function listCards() { // بطاقات الأماكن بعد البحث والفلترة
  var html = ""; // النص اللي بنبنيه
  var shown = 0; // عدد الأماكن الظاهرة
  var nextHour = new Date().getHours() + 1; // الساعة الجاية
  var order = spaces.slice(); // نسخة من قائمة الأماكن عشان نرتبها
  if (filters.sort == "rating") { order.sort(function (a, b) { return averageRating(b).avg - averageRating(a).avg; }); } // ترتيب من الأعلى تقييماً
  for (var i = 0; i < order.length; i++) { // نمر على الأماكن بالترتيب
    var s = order[i]; // المكان الحالي
    var text = filters.text.toLowerCase(); // كلمة البحث بحروف صغيرة
    var matchText = text == "" || s.name.toLowerCase().indexOf(text) >= 0 || s.building.toLowerCase().indexOf(text) >= 0; // يطابق الاسم أو المبنى؟
    var matchType = filters.type == "" || s.type == filters.type; // يطابق النوع؟
    var matchSeats = s.seats >= filters.seats; // يكفي عدد الكراسي؟
    var matchFloor = filters.floor == "" || s.floor == filters.floor; // يطابق الطابق؟
    if (!(matchText && matchType && matchSeats && matchFloor)) { continue; } // إذا ما طابق نتخطاه
    shown += 1; // نزيد العدد
    var free = nextHour < 20 && !isBusy(s.id, dateKey(0), nextHour); // هل الساعة الجاية متاحة؟
    var rating = averageRating(s); // متوسط التقييم
    html += '<div class="card tap" data-a="open" data-id="' + s.id + '"><div class="row"><div>'; // بداية البطاقة
    html += '<div class="b">' + s.name + '</div>'; // اسم المكان
    html += '<div class="mut">' + s.type + ' · ' + s.seats + ' seats · Floor ' + s.floor + '</div>'; // النوع والكراسي والطابق
    html += '<div class="mut">' + s.building + ' · ★ ' + rating.avg + ' (' + rating.count + ')</div></div>'; // المبنى والتقييم
    html += '<span class="badge ' + (free ? "ok" : "no") + '">' + (free ? "Free next hour" : "Busy next hour") + '</span></div></div>'; // شارة متاح أو مشغول
  }
  if (shown == 0) { html = '<p class="mut">No spaces match. Clear a filter or change the search.</p>'; } // إذا ما فيه نتائج
  return html; // نرجع البطاقات
}
function listScreen() { // شاشة قائمة الأماكن
  var html = topBar("") + "<h1>Study spaces</h1>" + '<p class="mut">Hello, ' + safe(data.name || data.user) + "</p>" + reminderBox(); // الشريط والعنوان والترحيب والتذكير
  html += '<input id="q" placeholder="Search by name or building" value="' + filters.text + '">'; // حقل البحث
  html += '<div class="f">'; // بداية الفلاتر
  html += '<select id="ft"><option value="">Any type</option><option' + (filters.type == "Table" ? " selected" : "") + '>Table</option><option' + (filters.type == "Room" ? " selected" : "") + '>Room</option></select>'; // فلتر النوع
  html += '<select id="fc"><option value="0">Any size</option><option value="4">4+ seats</option><option value="6">6+ seats</option><option value="8">8+ seats</option></select>'; // فلتر عدد الكراسي
  html += '<select id="ff"><option value="">Any floor</option><option value="1">Floor 1</option><option value="2">Floor 2</option><option value="3">Floor 3</option></select></div>'; // فلتر الطابق
  html += '<select id="fs" style="margin-bottom:14px"><option value="">Sort: default</option><option value="rating"' + (filters.sort == "rating" ? " selected" : "") + '>Sort: highest rating</option></select>'; // قائمة الترتيب
  html += '<div id="res">' + listCards() + '</div>'; // مكان بطاقات الأماكن
  return html; // نرجع الشاشة
}
function detailScreen() { // شاشة تفاصيل المكان والحجز
  var s = findSpace(view.id); // المكان المفتوح
  var r = averageRating(s); // تقييمه
  var html = topBar("list") + "<h1>" + s.name + "</h1>"; // الشريط والاسم
  html += '<div class="card"><div class="b">' + s.type + ' · ' + s.seats + ' seats</div>'; // النوع والكراسي
  html += '<div class="mut">Location: ' + s.building + ', floor ' + s.floor + '</div>'; // الموقع
  html += '<div class="mut">Facilities: ' + s.facilities + '</div>'; // المرافق
  html += '<div class="mut">Rating: ★ ' + r.avg + ' from ' + r.count + ' students</div></div>'; // التقييم
  html += "<h2>Student comments</h2>"; // عنوان التعليقات
  var anyComment = false; // هل فيه تعليقات؟
  for (var c = 0; c < data.bookings.length; c++) { // نمر على الحجوزات
    var bk = data.bookings[c]; // الحجز الحالي
    if (bk.space == s.id && bk.comment) { anyComment = true; html += '<div class="card"><div class="b">★ ' + bk.rating + '</div><div class="mut">' + safe(bk.comment) + '</div></div>'; } // نعرض التعليق
  }
  if (!anyComment) { html += '<p class="mut">No comments yet.</p>'; } // إذا ما فيه تعليقات
  html += "<h2>Choose a day</h2><div class=\"chips\">"; // عنوان اختيار اليوم
  for (var k = 0; k < 3; k++) { // 3 أيام: اليوم وبكرة وبعده
    var day = dateKey(k); // تاريخ اليوم
    html += '<button class="chip ' + (view.day == day ? "on" : "") + '" data-a="day" data-d="' + day + '">' + dateLabel(day).replace(",", "") + '</button>'; // زر اليوم
  }
  html += "</div><h2>How long?</h2><div class=\"chips\">"; // عنوان المدة
  for (var n = 1; n <= 2; n++) { // مدة ساعة أو ساعتين
    html += '<button class="chip ' + (view.length == n ? "on" : "") + '" data-a="dur" data-n="' + n + '">' + n + (n == 1 ? " hour" : " hours") + '</button>'; // زر المدة
  }
  html += "</div><h2>Available start times</h2><div class=\"slots\">"; // عنوان الأوقات
  for (var i = 0; i < hours.length; i++) { // نمر على كل الساعات
    var h = hours[i]; // الساعة الحالية
    var ok = canBook(s.id, view.day, h, view.length); // هل متاحة؟
    var cls = !ok ? "slot busy" : (view.hour == h ? "slot sel" : "slot"); // محجوزة أحمر، مختارة بنفسجي، متاحة أخضر
    html += '<button class="' + cls + '"' + (ok ? "" : " disabled") + ' data-a="pick" data-h="' + h + '">' + hourText(h) + '</button>'; // زر الوقت
  }
  html += "</div><br>"; // نقفل الأوقات
  if (view.hour == null) { html += '<button class="btn" data-a="book" disabled>Pick a start time</button>'; } // قبل ما تختارين وقت الزر معطل
  else { html += '<button class="btn" data-a="book">Book ' + hourText(view.hour) + ' – ' + hourText(view.hour + view.length) + '</button>'; } // بعد الاختيار يظهر وقت الحجز
  return html; // نرجع الشاشة
}
function confirmScreen() { // شاشة تأكيد الحجز
  var b = findBooking(view.id); // الحجز الجديد
  var s = findSpace(b.space); // مكانه
  var html = "<h1>Booking confirmed</h1>"; // العنوان
  html += '<div class="card"><div class="b">' + s.name + '</div>'; // اسم المكان
  html += '<div>' + dateLabel(b.day) + ', ' + hourText(b.hour) + ' – ' + hourText(b.hour + b.length) + '</div>'; // اليوم والوقت
  html += '<div class="mut">' + s.building + ', floor ' + s.floor + '</div>'; // الموقع
  html += '<div class="mut">Booking number: SS-' + String(b.id).slice(-5) + '</div></div>'; // رقم الحجز
  html += '<p class="mut">You will get a reminder 30 minutes before your booking starts.</p>'; // معلومة التذكير
  html += '<button class="btn" data-a="go" data-p="mine">View my bookings</button><br><br>'; // زر حجوزاتي
  html += '<button class="btn sec" data-a="go" data-p="list">Back to study spaces</button>'; // زر الرجوع للأماكن
  return html; // نرجع الشاشة
}
function findBooking(id) { // دالة تدور على حجز برقمه
  for (var i = 0; i < data.bookings.length; i++) { // نمر على الحجوزات
    if (data.bookings[i].id == id) { return data.bookings[i]; } // إذا الرقم يطابق نرجعه
  }
}
function mineScreen() { // شاشة حجوزاتي
  var up = upcomingBookings(); // القادمة
  var past = []; // السابقة والملغية
  for (var i = 0; i < data.bookings.length; i++) { // نمر على كل الحجوزات
    if (up.indexOf(data.bookings[i]) < 0) { past.push(data.bookings[i]); } // اللي مو قادمة نحطها في السابقة
  }
  var showPast = view.tab == "past"; // هل نعرض السابقة؟
  var list = showPast ? past : up; // القائمة اللي بنعرضها
  var html = topBar("") + "<h1>My bookings</h1>" + reminderBox(); // الشريط والعنوان والتذكير
  html += '<div class="chips"><button class="chip ' + (showPast ? "" : "on") + '" data-a="tab" data-t="up">Upcoming (' + up.length + ')</button>'; // تبويب القادمة
  html += '<button class="chip ' + (showPast ? "on" : "") + '" data-a="tab" data-t="past">Past (' + past.length + ')</button></div>'; // تبويب السابقة
  if (list.length == 0) { html += '<p class="mut">No bookings here yet.</p>'; } // إذا القائمة فاضية
  for (var j = 0; j < list.length; j++) { // نمر على الحجوزات المعروضة
    var b = list[j]; // الحجز الحالي
    var s = findSpace(b.space); // مكانه
    html += '<div class="card"><div class="b">' + s.name + '</div>'; // اسم المكان
    html += '<div>' + dateLabel(b.day) + ', ' + hourText(b.hour) + ' – ' + hourText(b.hour + b.length) + '</div>'; // اليوم والوقت
    html += '<div class="mut">' + s.building + ', floor ' + s.floor + '</div><br>'; // الموقع
    if (!showPast && view.ask == b.id) { html += '<div class="mut">Cancel this booking?</div><button class="btn sm red" data-a="cancel" data-id="' + b.id + '">Yes, cancel</button> <button class="btn sm sec" data-a="ask" data-id="0">Keep it</button>'; } // سؤال تأكيد الإلغاء
    else if (!showPast) { html += '<button class="btn sm sec" data-a="ask" data-id="' + b.id + '">Cancel booking</button>'; } // زر الإلغاء
    else if (b.cancelled) { html += '<span class="badge no">Cancelled</span>'; } // شارة ملغي
    else if (b.rating > 0) { html += '<div class="mut">You rated this ★ ' + b.rating + '</div>' + (b.comment ? '<div class="mut">“' + safe(b.comment) + '”</div>' : ''); } // تقييمي السابق مع تعليقي
    else { // لو ما قيّمتي
      html += '<input id="cm' + b.id + '" placeholder="Write a short comment (optional)" maxlength="120">'; // حقل التعليق
      html += '<div class="mut">Rate this space:</div><div class="stars">'; // عنوان التقييم
      for (var n = 1; n <= 5; n++) { html += '<button data-a="rate" data-id="' + b.id + '" data-n="' + n + '">★</button>'; } // 5 نجوم
      html += '</div>'; // نقفل النجوم
    }
    html += '</div>'; // نقفل البطاقة
  }
  return html; // نرجع الشاشة
}
function notificationsScreen() { // شاشة الإشعارات (US-14)
  var html = hdrNote(); // العنوان
  if (data.notifications.length == 0) { html += '<p class="mut">No notifications yet. They appear when you book, cancel or get a reminder.</p>'; } // إذا ما فيه إشعارات
  for (var i = 0; i < data.notifications.length; i++) { // نمر على الإشعارات
    var n = data.notifications[i]; // الإشعار الحالي
    html += '<div class="card"' + (n.read ? "" : ' style="border-color: var(--main)"') + '><div>' + safe(n.text) + '</div><div class="mut">' + new Date(n.time).toLocaleString("en") + '</div></div>'; // البطاقة (الجديد له إطار ملون)
    n.read = true; // نعلّمه مقروء
  }
  save(); // نحفظ
  return html; // نرجع الشاشة
}
function hdrNote() { // عنوان شاشة الإشعارات
  return topBar("") + "<h1>Notifications</h1>"; // الشريط والعنوان
}
function profileScreen() { // شاشة الملف الشخصي (US-15)
  var html = topBar("") + "<h1>My profile</h1>"; // الشريط والعنوان
  if (view.saved) { html += '<div class="note">Profile saved.</div>'; view.saved = false; } // رسالة بعد الحفظ
  html += '<label>University ID</label><div class="card">' + safe(data.user) + '</div>'; // الرقم الجامعي (للقراءة فقط)
  html += '<label for="pn">Name</label><input id="pn" placeholder="Your name" maxlength="40" value="' + safe(data.name) + '">'; // حقل الاسم
  html += '<label for="pr">Remind me before my booking</label><select id="pr">'; // قائمة وقت التذكير
  var options = [15, 30, 60]; // الخيارات بالدقائق
  for (var i = 0; i < options.length; i++) { // نمر على الخيارات
    html += '<option value="' + options[i] + '"' + (data.remindMin == options[i] ? " selected" : "") + '>' + options[i] + ' minutes before</option>'; // الخيار
  }
  html += '</select><br><br><button class="btn" data-a="saveProfile">Save</button>'; // زر الحفظ
  return html; // نرجع الشاشة
}
function drawNav() { // القائمة اللي تحت
  var nav = document.getElementById("nav"); // نجيب مكانها
  if (!data.user || view.page == "login") { nav.innerHTML = ""; return; } // ما نعرضها قبل الدخول
  var tabs = [["list", "Spaces"], ["mine", "Bookings (" + upcomingBookings().length + ")"], ["notifications", "Alerts (" + unreadCount() + ")"], ["profile", "Profile"]]; // أزرار القائمة: الصفحة والاسم
  var html = ""; // النص اللي بنبنيه
  for (var i = 0; i < tabs.length; i++) { // نمر على الأزرار
    var active = view.page == tabs[i][0] || (tabs[i][0] == "list" && (view.page == "detail" || view.page == "confirm")); // هل هذي الصفحة الحالية؟
    html += '<button class="' + (active ? "on" : "") + '" data-a="go" data-p="' + tabs[i][0] + '">' + tabs[i][1] + '</button>'; // الزر
  }
  nav.innerHTML = html; // نعرض القائمة
}
function render() { // دالة ترسم الشاشة الحالية
  checkReminders(); // نفحص إذا حان وقت تذكير
  var app = document.getElementById("app"); // مكان الرسم
  if (view.page == "login") { app.innerHTML = loginScreen(); } // شاشة الدخول
  else if (view.page == "list") { app.innerHTML = listScreen(); } // شاشة الأماكن
  else if (view.page == "detail") { app.innerHTML = detailScreen(); } // شاشة التفاصيل
  else if (view.page == "confirm") { app.innerHTML = confirmScreen(); } // شاشة التأكيد
  else if (view.page == "mine") { app.innerHTML = mineScreen(); } // شاشة حجوزاتي
  else if (view.page == "notifications") { app.innerHTML = notificationsScreen(); } // شاشة الإشعارات
  else if (view.page == "profile") { app.innerHTML = profileScreen(); } // شاشة الملف الشخصي
  drawNav(); // نرسم القائمة اللي تحت
  window.scrollTo(0, 0); // نرجع لأول الصفحة
}

// ===================== 6) الأحداث (لما تضغطين زر) =====================
var actions = { // كل زر له اسم (data-a) ودالة تشتغل
  login: function () { // زر Sign in
    var id = document.getElementById("id").value.trim(); // الرقم الجامعي
    var pw = document.getElementById("pw").value; // كلمة المرور
    var err = document.getElementById("er"); // مكان رسالة الخطأ
    if (id.length < 6 || isNaN(id)) { err.textContent = "Enter your university ID (at least 6 digits)."; return; } // لازم 6 أرقام أو أكثر
    if (pw.length < 4) { err.textContent = "Password must be at least 4 characters."; return; } // لازم 4 أحرف أو أكثر
    data.user = id; save(); view = { page: "list", tab: "up" }; render(); // ندخل ونفتح الأماكن
  },
  out: function () { data.user = ""; save(); view = { page: "login" }; render(); }, // تسجيل الخروج
  go: function (d) { view = { page: d.p, tab: "up" }; render(); }, // الانتقال لشاشة ثانية
  open: function (d) { view = { page: "detail", id: Number(d.id), day: dateKey(0), length: 1, hour: null }; render(); }, // فتح مكان
  day: function (d) { view.day = d.d; view.hour = null; render(); }, // اختيار يوم
  dur: function (d) { view.length = Number(d.n); view.hour = null; render(); }, // اختيار المدة
  pick: function (d) { view.hour = Number(d.h); render(); }, // اختيار وقت البداية
  book: function () { // زر الحجز
    if (!canBook(view.id, view.day, view.hour, view.length)) { view.hour = null; render(); return; } // نتأكد مرة ثانية إنه متاح
    var b = { id: Date.now() * 1000 + Math.floor(Math.random() * 1000), space: view.id, day: view.day, hour: view.hour, length: view.length, rating: 0, comment: "", reminded: false, cancelled: false }; // نسوي الحجز
    data.bookings.push(b); // نضيف الحجز للقائمة
    addNotification("Booking confirmed: " + findSpace(b.space).name + ", " + dateLabel(b.day) + " " + hourText(b.hour) + "."); // إشعار تأكيد الحجز
    save(); view = { page: "confirm", id: b.id }; render(); // نحفظ ونعرض التأكيد
  },
  tab: function (d) { view.tab = d.t; view.ask = 0; render(); }, // التبديل بين القادمة والسابقة
  ask: function (d) { view.ask = Number(d.id); render(); }, // سؤال تأكيد الإلغاء
  cancel: function (d) { // إلغاء الحجز (يرجع الوقت متاح)
    var b = findBooking(d.id); // الحجز
    b.cancelled = true; // نعلّمه ملغي
    addNotification("Booking cancelled: " + findSpace(b.space).name + ", " + dateLabel(b.day) + " " + hourText(b.hour) + "."); // إشعار الإلغاء
    view.ask = 0; render(); // نرسم من جديد
  },
  rate: function (d) { // حفظ التقييم والتعليق
    var box = document.getElementById("cm" + d.id); // حقل التعليق
    var b = findBooking(d.id); // الحجز
    b.rating = Number(d.n); // نحفظ النجوم
    b.comment = box ? box.value.trim() : ""; // نحفظ التعليق
    addNotification("Thanks! You rated " + findSpace(b.space).name + " " + d.n + " stars."); // إشعار شكر
    render(); // نرسم من جديد
  },
  saveProfile: function () { // زر حفظ الملف الشخصي
    data.name = document.getElementById("pn").value.trim(); // نحفظ الاسم
    data.remindMin = Number(document.getElementById("pr").value); // نحفظ وقت التذكير
    save(); view.saved = true; render(); // نحفظ ونعرض رسالة
  }
};
document.addEventListener("click", function (e) { // نسمع أي ضغطة في الصفحة
  var btn = e.target.closest("[data-a]"); // نشوف إذا الضغطة على عنصر له data-a
  if (btn && actions[btn.dataset.a]) { actions[btn.dataset.a](btn.dataset); } // إذا موجود نشغل الدالة
});
document.addEventListener("input", function (e) { // نسمع الكتابة في البحث
  if (e.target.id == "q") { filters.text = e.target.value; document.getElementById("res").innerHTML = listCards(); } // نحدث النتائج مباشرة
});
document.addEventListener("change", function (e) { // نسمع تغيير الفلاتر
  if (e.target.id == "ft") { filters.type = e.target.value; } // فلتر النوع
  else if (e.target.id == "fc") { filters.seats = Number(e.target.value); } // فلتر الكراسي
  else if (e.target.id == "ff") { filters.floor = e.target.value; } // فلتر الطابق
  else if (e.target.id == "fs") { filters.sort = e.target.value; } // الترتيب
  else { return; } // أي شي ثاني نتجاهله
  document.getElementById("res").innerHTML = listCards(); // نحدث النتائج
});
setInterval(function () { checkReminders(); drawNav(); }, 30000); // كل 30 ثانية نفحص التذكيرات ونحدث العداد
render(); // نرسم أول شاشة لما يفتح التطبيق
