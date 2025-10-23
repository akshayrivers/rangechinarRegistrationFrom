"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// SPOC Data
const spocData = [
  {
    "SPOC Name": "FAIZAN TARIQ",
    "SPOC Email": "faizaaannn94@gmail.com",
    "SPOC Phone Number": "9149403009",
    "Institution Name": "GOVT BOYS HIGHER SECONDARY SCHOOL SOURA"
  },
  {
    "SPOC Name": "Shaziya Mushtaq",
    "SPOC Email": "mailshazia2021@gmail.com",
    "SPOC Phone Number": "9596000768",
    "Institution Name": "SKIMS MCH"
  },
  {
    "SPOC Name": "Minha nazir",
    "SPOC Email": "minhanazir959@gmail.com",
    "SPOC Phone Number": "9541414425",
    "Institution Name": "Islamic university of science and technology "
  },
  {
    "SPOC Name": "Dr. Mahjabeen Akhter",
    "SPOC Email": "drmahjabeenakhter5@gmail.com",
    "SPOC Phone Number": "9622742761",
    "Institution Name": "Govt Women College Nawakadal "
  },
  {
    "SPOC Name": "Dr. Adil Nazki",
    "SPOC Email": "nazkiadi@cukashmir.ac.in",
    "SPOC Phone Number": "9858350723",
    "Institution Name": "Central University of Kashmir "
  },
  {
    "SPOC Name": "Dr. Ajaz Ahmad Mistree",
    "SPOC Email": "Justmailaju@gmail.com",
    "SPOC Phone Number": "9906699955",
    "Institution Name": "SSM College of Engineering "
  },
  {
    "SPOC Name": "Shahid Ahmad Wani ",
    "SPOC Email": "Shahidwani@nitsri.ac.in",
    "SPOC Phone Number": "+91 70063 41261",
    "Institution Name": "GCET Safapora "
  },
  {
    "SPOC Name": "Dr Shahnawaz Kawoosa",
    "SPOC Email": "nawaz.kawoosa@yahoo.in",
    "SPOC Phone Number": "+91 70062 70654",
    "Institution Name": "Kashmir Tibia College"
  },
  {
    "SPOC Name": "A Prof Durri Shahwar ",
    "SPOC Email": "shahwardurri@gmail.com",
    "SPOC Phone Number": "9796945040",
    "Institution Name": "Vishwa Bharti Degree College "
  },
  {
    "SPOC Name": "Irfan",
    "SPOC Email": "apssrinagarkmr@gmail.com",
    "SPOC Phone Number": "9858399950",
    "Institution Name": "Army Public School"
  },
  {
    "SPOC Name": "Rafiya Jan",
    "SPOC Email": "rafiyajan.bhat@gmail.com",
    "SPOC Phone Number": "7006323155",
    "Institution Name": "University of Kashmir"
  },
  {
    "SPOC Name": "MR MANZOOR AHMAD DAR",
    "SPOC Email": "shaansahib2008@gmail.com",
    "SPOC Phone Number": "9622853815",
    "Institution Name": "new dream land educational institute "
  },
  {
    "SPOC Name": " Dr.Shahnawaz Kawoosa",
    "SPOC Email": "nawaz.kawoosa@yahoo.in",
    "SPOC Phone Number": "7006270654",
    "Institution Name": "KASHMIR TIBIA COLLEGE"
  },
  {
    "SPOC Name": "MUDASIR AHMAD WANI",
    "SPOC Email": "mudasurwani@cukashmir.ac.in",
    "SPOC Phone Number": "7006588751",
    "Institution Name": "HEE BEMINA"
  },
  {
    "SPOC Name": "Dr. Azra Bashir",
    "SPOC Email": "azra@kcet.edu.in",
    "SPOC Phone Number": "7006734614",
    "Institution Name": "Kashmir College of Engineering and Technology"
  },
  {
    "SPOC Name": "Mr. Anaytullah Haji",
    "SPOC Email": "anayathajiimssa@gmail.com",
    "SPOC Phone Number": "9682338696",
    "Institution Name": "Iqbal Memorial Secondary School Ajas"
  },
  {
    "SPOC Name": "SHAHNAWAZ AHMAD",
    "SPOC Email": "Kingnawaz97@gmail.com",
    "SPOC Phone Number": "7006891710",
    "Institution Name": "BHSS SAFAPORA"
  },
  {
    "SPOC Name": "Shah Faisal",
    "SPOC Email": "Sfaisal0202@gmail.com",
    "SPOC Phone Number": "9149878496",
    "Institution Name": "Al Noor Para Medical & Nursing Institute. "
  },
  {
    "SPOC Name": "Dr.Khursheed Ahmad",
    "SPOC Email": "mkhursheedn26@gmail.com",
    "SPOC Phone Number": "7006002377",
    "Institution Name": "GDC Shopian"
  },
  {
    "SPOC Name": "Saima Khan",
    "SPOC Email": "mailsaimakhans@gmail.com",
    "SPOC Phone Number": "9596970035",
    "Institution Name": "Government Degree College Sopore"
  },
  {
    "SPOC Name": "MUDASIR MANZOOR",
    "SPOC Email": "mudasir465@gmail.com",
    "SPOC Phone Number": "7006658003",
    "Institution Name": "GOVT BHSS CHARAR I SHARIEF "
  },
  {
    "SPOC Name": "Junaid hussain yetoo ",
    "SPOC Email": "Yetoojunaid@gmail.com",
    "SPOC Phone Number": "9596185358",
    "Institution Name": "Government High school panzath "
  },
  {
    "SPOC Name": "Dr Meer Umer",
    "SPOC Email": "umeer1950@gmail.com",
    "SPOC Phone Number": "9906936999",
    "Institution Name": "Government Polytechnic College"
  },
  {
    "SPOC Name": "Dr. Farhat Hassan",
    "SPOC Email": "farhathassanwani52652@gmail.com",
    "SPOC Phone Number": "9906874251",
    "Institution Name": "Srinagar womens college srinagar Zakura "
  },
  {
    "SPOC Name": "Dr Farhana Mehraj Allai ",
    "SPOC Email": "faruallai@gmail.com",
    "SPOC Phone Number": "7006137658",
    "Institution Name": "Islamic University of Science and Technology "
  },
  {
    "SPOC Name": "Dr Bashir Ahmad",
    "SPOC Email": "drgamgeen8971@gmail.com",
    "SPOC Phone Number": "7780931110",
    "Institution Name": "Gdcmagam"
  },
  {
    "SPOC Name": "Riyaz Ahmad Bhat",
    "SPOC Email": "ayazbhat991@gmail.com",
    "SPOC Phone Number": "9797082024",
    "Institution Name": "GHSS NOWGAM"
  },
  {
    "SPOC Name": "Dr. Idris Afzal Shah",
    "SPOC Email": "Idris.shah@nift.ac.in",
    "SPOC Phone Number": "9596011541",
    "Institution Name": "NIFT Srinagar"
  },
  {
    "SPOC Name": "Zahid ",
    "SPOC Email": "Zahidbhatsr@gmail.com",
    "SPOC Phone Number": "9018555737",
    "Institution Name": "Lakecity college "
  },
  {
    "SPOC Name": "Javaid Ayub sheikh ",
    "SPOC Email": "sunatjavaidps@gmail.com",
    "SPOC Phone Number": "9596163577",
    "Institution Name": "GDC Khansahib"
  },
  {
    "SPOC Name": "Dr. Saba niaz",
    "SPOC Email": "sobnewtonn@gmail.com",
    "SPOC Phone Number": "8082788332",
    "Institution Name": "Govt girls higher secondary school soura"
  },
  {
    "SPOC Name": "Dr Abina Habib",
    "SPOC Email": "abinahabib@gmail.com",
    "SPOC Phone Number": "9797009106",
    "Institution Name": "GCW MA Road"
  },
  {
    "SPOC Name": "Taqwa Mukhtar ",
    "SPOC Email": "babataqwa89@gmail.com",
    "SPOC Phone Number": "8493033651",
    "Institution Name": "Islamic University of Science and Technology "
  },
  {
    "SPOC Name": "Tooba Hilal Wani",
    "SPOC Email": "Toobahilal356@gmail.com",
    "SPOC Phone Number": "7889725023",
    "Institution Name": "Islamic University of science and technology"
  },
  {
    "SPOC Name": "Ishfaq Maqbool ",
    "SPOC Email": "ishfaqmaqbool14@gmail.com",
    "SPOC Phone Number": "7889646497",
    "Institution Name": "City School Anantnag "
  },
  {
    "SPOC Name": "Farhana Allai",
    "SPOC Email": "Faruallai@gmail.com",
    "SPOC Phone Number": "+91 70061 37658",
    "Institution Name": "IUST, Awantipora"
  },
  {
    "SPOC Name": "Farhana illahi",
    "SPOC Email": "faruallai@gmail.com",
    "SPOC Phone Number": "7006137658",
    "Institution Name": "Islamic university of science and technology "
  },
  {
    "SPOC Name": "Dr. Mohmad Azhar",
    "SPOC Email": "mohmadazhar286@gmail.com",
    "SPOC Phone Number": "9149539973",
    "Institution Name": "Islamic University of Science and Technology "
  },
  {
    "SPOC Name": "Shahid ashraf sofi ",
    "SPOC Email": "shahidashrf10@gmail.com",
    "SPOC Phone Number": "6006919076",
    "Institution Name": "Ihm srinagar "
  },
  {
    "SPOC Name": "Furqan bin subzar",
    "SPOC Email": "furkansoub07@gmail.com",
    "SPOC Phone Number": "6006347980",
    "Institution Name": "IHM srinagar "
  },
  {
    "SPOC Name": "Ibrahim feroz ",
    "SPOC Email": "bhatibrahim220@gmail.com",
    "SPOC Phone Number": "7889786250",
    "Institution Name": "Institute of hotel management "
  },
  {
    "SPOC Name": "Adnan ",
    "SPOC Email": "adnanjavaid040@gmail.com",
    "SPOC Phone Number": "7006198809",
    "Institution Name": "Ihm srinagar "
  },
  {
    "SPOC Name": "Shah kashif hussain ",
    "SPOC Email": "kashifhussain985695666@gmail.com",
    "SPOC Phone Number": "9797488028",
    "Institution Name": "IHM SRINAGAR"
  },
  {
    "SPOC Name": "Prof. S. A. Gangoo ",
    "SPOC Email": "dsw@skuastkasmir.ac.in",
    "SPOC Phone Number": "9419076319",
    "Institution Name": "Shere kashmir university of agricultural sciences and technology of Kashmir "
  },
  {
    "SPOC Name": "Nazaliya noor",
    "SPOC Email": "nazaliyanoor3@gmail.com",
    "SPOC Phone Number": "9103114755",
    "Institution Name": "Ihm Srinagar "
  },
  {
    "SPOC Name": "Nida khursheed ",
    "SPOC Email": "nidakhursheeddar@gmail.com",
    "SPOC Phone Number": "9103113133",
    "Institution Name": "IHM RAJBAGH SRINAGAR "
  },
  {
    "SPOC Name": "Mir Khusrau ",
    "SPOC Email": "mirkhusrau5@gmail.com",
    "SPOC Phone Number": "7006089568",
    "Institution Name": "SP College, Srinagar "
  },
  {
    "SPOC Name": "MEHROOMA AKBAR ",
    "SPOC Email": "darmehrudarmehru@gmail.com",
    "SPOC Phone Number": "9149552613 ",
    "Institution Name": "Islamia college of Science and Commerce "
  },
  {
    "SPOC Name": "Dr Nusrat Nabi",
    "SPOC Email": "Nusratthaji@gmail.com",
    "SPOC Phone Number": "9697978197",
    "Institution Name": "Govt.Degree college ganderbal"
  },
  {
    "SPOC Name": "MAGRAY AJAZ AHMAD",
    "SPOC Email": "principal@gdcboysang.ac.in ",
    "SPOC Phone Number": "9596441959",
    "Institution Name": "SHMM GDC ANANTNAG"
  },
  {
    "SPOC Name": "Bilal Ahmed Malik ",
    "SPOC Email": "Bilalmalik61@gmail.com",
    "SPOC Phone Number": "8803914713",
    "Institution Name": "Crescent public School naseembagh srinagar "
  },
  {
    "SPOC Name": "Junaid-ul-Shabar Khan ",
    "SPOC Email": "hydereqarar@gmail.com",
    "SPOC Phone Number": "7006590062",
    "Institution Name": "Crescent Public School"
  },
  {
    "SPOC Name": "Fiza Qureashi",
    "SPOC Email": "qureshifiza7@gmail.com",
    "SPOC Phone Number": "7006503313",
    "Institution Name": "Green Valley Educational Institute "
  },
  {
    "SPOC Name": "Saiqa ",
    "SPOC Email": "saikabhatt905@gmail.com",
    "SPOC Phone Number": "9149466626",
    "Institution Name": "islamia college of science and commerce srinagar"
  },
  {
    "SPOC Name": "Sahban Khan",
    "SPOC Email": "sahban354@gmail.com",
    "SPOC Phone Number": "9797807239",
    "Institution Name": "Institute of Hotel Management Srinagar"
  },
  {
    "SPOC Name": "Mrs Afshana Bashir",
    "SPOC Email": "afshanabashir88@gmail.com",
    "SPOC Phone Number": "7006604846",
    "Institution Name": "Kashmir Law College"
  },
  {
    "SPOC Name": "Syed Akeela Gillani ",
    "SPOC Email": "syedakeela786@gmail.com",
    "SPOC Phone Number": "7006751169",
    "Institution Name": "Ingenious School "
  },
  {
    "SPOC Name": "Dr.Mahjabeen Akhter",
    "SPOC Email": "drmahjabeenakh5@gmail.com",
    "SPOC Phone Number": "9622742761",
    "Institution Name": "Govt College for women Nawakadal"
  },
  {
    "SPOC Name": "Anam Tariq",
    "SPOC Email": "Casetcollege2001@gmail.com",
    "SPOC Phone Number": "7006477954",
    "Institution Name": "CASET college of Computer Science"
  },
  {
    "SPOC Name": "Dr. Syed Mutahar Aaqib",
    "SPOC Email": "dr.syedmutahar@gmail.com",
    "SPOC Phone Number": "9419969143",
    "Institution Name": "Government Degree College (Autonomous), Baramulla"
  },
  {
    "SPOC Name": "Madiha msuhtaq",
    "SPOC Email": "Madihamushtaq65@gmail.com",
    "SPOC Phone Number": "9682548759",
    "Institution Name": "Islamic college of science and commerce "
  },
  {
    "SPOC Name": "Mehrooma Akbar ",
    "SPOC Email": "darmehrudarmehru@gmail.com",
    "SPOC Phone Number": "9149552613",
    "Institution Name": "Islamia College of Science and Commerce "
  },
  {
    "SPOC Name": "Faris ",
    "SPOC Email": "Farishaider93@gmail.com",
    "SPOC Phone Number": "7051009486",
    "Institution Name": "Goverment boys higher secondary soura srinagar "
  },
  {
    "SPOC Name": "Dr.Abina Habib",
    "SPOC Email": "abinahabib@gmail.com",
    "SPOC Phone Number": "9797009106",
    "Institution Name": "GCW MA Road"
  },
  {
    "SPOC Name": "Zeyan Farooq",
    "SPOC Email": "bhatzeyan7051@gmail.com",
    "SPOC Phone Number": "7051180536",
    "Institution Name": "Boys higher secondary school soura"
  },
  {
    "SPOC Name": "Adnan majeed ",
    "SPOC Email": "aa6851567@gmail.com",
    "SPOC Phone Number": "7006816841",
    "Institution Name": "Govt.boys higher secondary school soura"
  },{
    "SPOC Name": "Anam Tariq",
    "SPOC Email": "casetcollege2001@gmail.com",
    "SPOC Phone Number": 7006477954,
    "Institution Name": "CASET college of Computer Science "
  },
  {
    "SPOC Name": "Rahil rashid ",
    "SPOC Email": "bhatrahil302@gmail.com",
    "SPOC Phone Number": 6006939640,
    "Institution Name": " Boys Higher Secondary, Soura"
  },
  {
    "SPOC Name": "Motaz",
    "SPOC Email": "moatazayoub@gamil.com",
    "SPOC Phone Number": 6005363304,
    "Institution Name": "Govt boys higher secondary school soura"
  },
  {
    "SPOC Name": "Bushra",
    "SPOC Email": "bushrashafi002@gmail.com",
    "SPOC Phone Number": 9103705094,
    "Institution Name": "Islamia college  of science and commerce "
  },
  {
    "SPOC Name": "Aiman",
    "SPOC Email": "Qadiraiman98@gmail.com",
    "SPOC Phone Number": 8899449326,
    "Institution Name": "Iust"
  },
  {
    "SPOC Name": "Azhar Shafat",
    "SPOC Email": "azharshafat47@gmail.com",
    "SPOC Phone Number": 9596209236,
    "Institution Name": "Govt boys higher secondary school soura"
  },
  {
    "SPOC Name": "Syed Shuja Razvi",
    "SPOC Email": "syedshuja118@gmail.com",
    "SPOC Phone Number": 9149707034,
    "Institution Name": "Alasma Educational Institute Budgam"
  },
  {
    "SPOC Name": "Rutba jan ",
    "SPOC Email": "rutbas417@gmail.com",
    "SPOC Phone Number": 9796172848,
    "Institution Name": "Islamia college of science and commerce "
  },
  {
    "SPOC Name": "Firas",
    "SPOC Email": "kuthoofiras@gmail.com",
    "SPOC Phone Number": 9906374848,
    "Institution Name": "Institute of Hotel Management"
  },
  {
    "SPOC Name": "Mehvish Manzoor ",
    "SPOC Email": "syedamehvish978@gmail.com",
    "SPOC Phone Number": 6006490354,
    "Institution Name": "Islamia College of science and commerce "
  },
  {
    "SPOC Name": "Nasreen ",
    "SPOC Email": "nasreena.nazir@kashmirharvard.org",
    "SPOC Phone Number": 9469942169,
    "Institution Name": "Kashmir Harvard Educational Institute "
  }
]

interface SpocEntry {
  "SPOC Name": string;
  "SPOC Email": string;
  "SPOC Phone Number": string;
  "Institution Name": string;
}

// ✅ MODIFIED: Zod Schema
const registrationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .length(10, "Phone number must be only 10 digits")
    .regex(/^\d+$/, "Phone must contain only numbers")
    .transform((val) => Number(val)),
  organization: z.string().min(1, "Organization is required"),
  state: z.string().min(1, "State is required"),
  gender: z.string().min(1, "Gender is required"),
  is_nit_student: z.boolean(),
  participant_category: z.string().optional(),
  selected_events: z.array(z.string()),
  attend_day1: z.boolean(),
  attend_day2: z.boolean(),
  agree_to_rules: z.boolean().refine(val => val === true, {
    message: "You must agree to the event rules"
  }),
  "INSTITUTE NAME": z.string().optional(),
  "SPOC NAME": z.string().optional(),
  "SPOC EMAIL": z.string().optional(),
  "SPOC PHONE": z.string().optional(),
})
// ✅ MODIFIED: SuperRefine for conditional SPOC validation
.superRefine((data, ctx) => {
  // ✅ MODIFIED: SPOC is only required for non-NIT school/college students
  const isSpocRequired = !data.is_nit_student &&
                         (data.participant_category === 'school' ||
                          data.participant_category === 'college');

  // If the user is NOT a NIT student, AND is school/college
  if (isSpocRequired) {
    if (!data["INSTITUTE NAME"] || data["INSTITUTE NAME"] === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Institute is required",
        path: ["INSTITUTE NAME"],
      });
    }
    if (!data["SPOC NAME"] || data["SPOC NAME"] === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SPOC Name is required",
        path: ["SPOC NAME"],
      });
    }
    if (!data["SPOC PHONE"] || data["SPOC PHONE"] === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SPOC Phone is required",
        path: ["SPOC PHONE"],
      });
    }
    
    // Check for SPOC email
    if (!data["SPOC EMAIL"] || data["SPOC EMAIL"] === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SPOC Email is required",
        path: ["SPOC EMAIL"],
      });
    } else if (!z.string().email().safeParse(data["SPOC EMAIL"]).success) {
       ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        validation: "email",
        message: "Invalid SPOC Email",
        path: ["SPOC EMAIL"],
      });
    }
  }
  // If not isSpocRequired (i.e., NIT student, alumni, or others), 
  // the fields will be pre-filled and are valid.
});


type RegistrationData = z.input<typeof registrationSchema>;

interface Event {
  id: string | number;
  name: string;
  description: string;
  sub_category: string;
  fee: number;
  category: string;
  day: string; // "1", "2", or "1 2"
}

// Fee categories
const participantCategories = [
  { id: "school", name: "School Student (till Class 10)", fee: 20 },
  { id: "college", name: "College Student (Including Class 11 & 12)", fee: 29 },
  { id: "alumni", name: "NIT Alumni ", fee: 299 },
  { id: "others", name: "Others (With Any govt ID)", fee: 999 }
];

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeDay, setActiveDay] = useState("1"); // Default to day 1
  const [showRules, setShowRules] = useState(false);
  const [totalFee, setTotalFee] = useState(0);
  const [entryFee, setEntryFee] = useState(0);
  const [eventsFee, setEventsFee] = useState(0);

  const [form, setForm] = useState<RegistrationData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    organization: "",
    state: "",
    gender: "",
    is_nit_student: false,
    participant_category: "college", // Default to college student
    selected_events: [],
    attend_day1: true, // Default to attending day 1
    attend_day2: false,
    agree_to_rules: false,
    "INSTITUTE NAME": "",
    "SPOC NAME": "",
    "SPOC EMAIL": "",
    "SPOC PHONE": "",
  });

  // ✅ MODIFIED: This useEffect handles clearing/setting SPOC data based on 
  // NIT status OR participant category (alumni/others)
  useEffect(() => {
    if (form.is_nit_student) {
      // Case 1: NIT Student
      setForm((prev) => ({
        ...prev,
        "INSTITUTE NAME": "nit no spoc",
        "SPOC NAME": "nit no spoc",
        "SPOC EMAIL": "nit@nospoc.com", // Valid dummy email
        "SPOC PHONE": "0000000000",   // Valid dummy phone
      }));
    } else if (form.participant_category === 'alumni') {
      // Case 2: NIT Alumni
      setForm((prev) => ({
        ...prev,
        "INSTITUTE NAME": "nit alumini no spoc",
        "SPOC NAME": "nit alumini no spoc",
        "SPOC EMAIL": "alumni@nospoc.com", // Valid dummy email
        "SPOC PHONE": "0000000000",      // Valid dummy phone
      }));
    } else if (form.participant_category === 'others') {
      // Case 3: Others (Special Entry)
      setForm((prev) => ({
        ...prev,
        "INSTITUTE NAME": "special entry no spoc",
        "SPOC NAME": "special entry no spoc",
        "SPOC EMAIL": "special@nospoc.com", // Valid dummy email
        "SPOC PHONE": "0000000000",       // Valid dummy phone
      }));
    } else {
      // Case 4: School or College student (not NIT)
      // Clear fields to force selection from dropdown
      // This runs if they switch from 'alumni' back to 'college'
      setForm((prev) => ({
        ...prev,
        "INSTITUTE NAME": "",
        "SPOC NAME": "",
        "SPOC EMAIL": "",
        "SPOC PHONE": "",
      }));
    }
  }, [form.is_nit_student, form.participant_category]); // ✅ MODIFIED: Dependencies


  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        const eventsArray = Array.isArray(data) ? data : data.events || [];
        
        setEvents(eventsArray);
        setFilteredEvents(eventsArray.filter((event:any) => event.day.includes(activeDay)));
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setEvents([]);
        setFilteredEvents([]);
      });
  }, []);
  

  // Helper function to check if an event is a haunted house event
  const isHauntedHouseEvent = (event: Event) => {
    return event.name.toLowerCase().includes("haunted house");
  };

  // Check if selected events are from days the user hasn't selected
  useEffect(() => {
    // If user deselects a day, automatically deselect events from that day
    if (!form.attend_day1 || !form.attend_day2) {
      const updatedSelectedEvents = form.selected_events.filter(eventId => {
        const event = events.find(e => String(e.id) === eventId);
        if (!event) return false;
        
        // Keep event if it's on a day the user is attending
        if (form.attend_day1 && event.day.includes("1")) return true;
        if (form.attend_day2 && event.day.includes("2")) return true;
        return false;
      });
      
      if (updatedSelectedEvents.length !== form.selected_events.length) {
        setForm(prev => ({
          ...prev,
          selected_events: updatedSelectedEvents
        }));
      }
    }
  }, [form.attend_day1, form.attend_day2, events]);

  // Auto-select days if user selects events from those days
  useEffect(() => {
    let needsDay1 = false;
    let needsDay2 = false;

    form.selected_events.forEach(eventId => {
      const event = events.find(e => String(e.id) === eventId);
      if (!event) return;

      if (event.day.includes("1")) needsDay1 = true;
      if (event.day.includes("2")) needsDay2 = true;
    });

    // Auto-update day selection if needed
    if ((needsDay1 && !form.attend_day1) || (needsDay2 && !form.attend_day2)) {
      setForm(prev => ({
        ...prev,
        attend_day1: needsDay1 ? true : prev.attend_day1,
        attend_day2: needsDay2 ? true : prev.attend_day2
      }));
    }
  }, [form.selected_events, events]);

  // Calculate fees whenever relevant form fields change
  useEffect(() => {
    // Get selected events
    const selectedEventObjs = events.filter((event) =>
      form.selected_events.includes(String(event.id))
    );
    
    // Initialize event fees
    let newEventsFee = 0;
    let newEntryFee = 0;
    
    if (form.is_nit_student) {
      // For NIT students: Charge for Workshop category AND Haunted House events
      newEventsFee = selectedEventObjs
        .filter(event => isHauntedHouseEvent(event))
        .reduce((sum, ev) => sum + ev.fee, 0);
      // NIT students don't pay entry fee
      newEntryFee = 0;
    } else {
      // For non-NIT participants: Charge for event fees
      newEventsFee = selectedEventObjs.reduce((sum, ev) => sum + ev.fee, 0);
      
      // Charge a SINGLE entry fee if attending at least one day
      const selectedCategory = participantCategories.find(cat => cat.id === form.participant_category);
      const singleEntryFee = selectedCategory ? selectedCategory.fee : 29; // Default to college student fee
      
      if (form.attend_day1 || form.attend_day2) {
        newEntryFee = singleEntryFee;
      }
    }
    
    setEventsFee(newEventsFee);
    setEntryFee(newEntryFee);
    setTotalFee(newEventsFee + newEntryFee);
  }, [form.selected_events, form.is_nit_student, form.participant_category, form.attend_day1, form.attend_day2, events]);

  const handleInput = (key: keyof RegistrationData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ MODIFIED: SPOC Handler
  const handleInstituteChange = (instituteName: string) => {
    // ✅ ADDED: Helper variable to check if fields should be locked
    const spocFieldsLocked = form.is_nit_student || 
                             form.participant_category === 'alumni' || 
                             form.participant_category === 'others';
    
    // ✅ MODIFIED: Do nothing if fields are locked
    if (spocFieldsLocked) return;

    const selectedSpoc = spocData.find(
      (spoc) => spoc["Institution Name"] === instituteName
    );

    if (selectedSpoc) {
      setForm((prev) => ({
        ...prev,
        "INSTITUTE NAME": selectedSpoc["Institution Name"],
        "SPOC NAME": selectedSpoc["SPOC Name"],
        "SPOC EMAIL": selectedSpoc["SPOC Email"],
        "SPOC PHONE": (selectedSpoc["SPOC Phone Number"] ?? '').replace(/[^0-9]/g, ''), // Clean phone number
      }));
    } else {
      // Clear fields if "Select..." is chosen
      setForm((prev) => ({
        ...prev,
        "INSTITUTE NAME": "",
        "SPOC NAME": "",
        "SPOC EMAIL": "",
        "SPOC PHONE": "",
      }));
    }
  };

  const toggleEvent = (id: string | number) => {
    const idStr = String(id);
    setForm((prev) => {
      const updated = prev.selected_events.includes(idStr)
        ? prev.selected_events.filter((e) => e !== idStr)
        : [...prev.selected_events, idStr];
      return { ...prev, selected_events: updated };
    });
  };

  const handleRulesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRules(true);
  };

  const handleCloseRules = () => {
    setShowRules(false);
  };

  const handleSubmit = () => {
    // Validate that at least one day is selected
    if (!form.attend_day1 && !form.attend_day2) {
      alert("Please select at least one day to attend");
      return;
    }

    const result = registrationSchema.safeParse(form);

    if (!result.success) {
      console.error("Validation error:", result.error.format());
      // Show the first error message
      alert(result.error.errors[0].message);
      return;
    }

    const transformedData = {
      ...result.data,
      total_fee: totalFee,
      entry_fee: entryFee,
      events_fee: eventsFee
    };

    // Log to check data before sending
    console.log("Saving to local storage:", transformedData);

    localStorage.setItem("registration_data", JSON.stringify(transformedData));
    router.push("/payment");
  };

  const uniqueCategories = ["All", ...new Set(events.map((e) => e.category))];

  // Filter events based on selected day and category
  useEffect(() => {
    setFilteredEvents(
      events
        .filter(e => e.day.includes(activeDay))
        .filter(e => categoryFilter === "All" ? true : e.category === categoryFilter)
    );
  }, [categoryFilter, events, activeDay]);

  // Switch between day tabs
  const switchDay = (day: string) => {
    setActiveDay(day);
    setCategoryFilter("All"); // Reset category filter when switching days
  };

  // Display message about fee policy based on user type
  const getFeeExplanation = () => {
    if (form.is_nit_student) {
      return (
        <div className="mt-2 bg-green-50 p-3 rounded-lg text-sm">
          <p className="font-medium text-green-700">Fee Policy for NIT Students:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Haunted House: Regular fee applies</li>
            <li>All other events: Free (no charge)</li>
            <li>No Entry Fee. SPOC details are not required.</li>
          </ul>
        </div>
      );
    } else {
      // --- (MODIFIED) ---
      const oneTimeFee = participantCategories.find(cat => cat.id === form.participant_category)?.fee || 29;
      
      // ✅ MODIFIED: Add logic for alumni/others SPOC info
      let spocMessage = "SPOC details from your institute are required."; // Default
      if (form.participant_category === 'alumni' || form.participant_category === 'others') {
        spocMessage = "SPOC details are not required for this category.";
      }

      return (
        <div className="mt-2 bg-indigo-50 p-3 rounded-lg text-sm">
          <p className="font-medium text-indigo-700 mb-1">Fee Policy for External Participants:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Event registration: Regular event fees apply</li>
            <li>Entry fee: <span className="font-medium">A one-time fee of ₹{oneTimeFee} is required if attending one or both days.</span></li>
            <li>{spocMessage}</li> {/* ✅ MODIFIED */}
          </ul>
        </div>
      );
      // --- (END MODIFICATION) ---
    }
  };

  // ✅ ADDED: Helper variable for JSX
  const spocFieldsDisabled = form.is_nit_student || 
                             form.participant_category === 'alumni' || 
                             form.participant_category === 'others';

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-10 text-center text-indigo-900">
        🌟 Rang-e-Chinar 2.0 Event Registration
      </h1>

      {/* Personal Info */}
      <section className="space-y-6 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-indigo-100">
        <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
          <span className="mr-2">👤</span> Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ... (First Name, Last Name, Email, Phone, Org, State, Gender - no changes) ... */}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => handleInput("first_name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => handleInput("last_name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              placeholder="Enter last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleInput("email", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone as string}
              onChange={(e) => handleInput("phone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              placeholder="10-digit number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => handleInput("organization", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              placeholder="Your organization/college"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => handleInput("state", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              placeholder="Your state"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => handleInput("gender", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>


          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <div className="flex items-center mr-6 mb-2 sm:mb-0">
              <input
                type="checkbox"
                id="is_nit_student"
                checked={form.is_nit_student}
                onChange={(e) => handleInput("is_nit_student", e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 mr-2"
              />
              <label htmlFor="is_nit_student" className="text-sm font-medium text-gray-700">
                NIT Srinagar Student 
              </label>
            </div>
            
            {/* Participant Category Dropdown */}
            {!form.is_nit_student && (
              <div className="w-full">
                <select
                  value={form.participant_category}
                  onChange={(e) => handleInput("participant_category", e.target.value)}
                  disabled={form.is_nit_student} // Correct: only disabled if NIT student box is checked
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all text-sm disabled:cursor-not-allowed disabled:bg-gray-200"
                >
                  {participantCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} - ₹{category.fee}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ✅ START: SPOC Information Section */}
          <div className="sm:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              {/* ✅ MODIFIED: Title */}
              SPOC Information (Required for School/College)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Institute
                </label>
                <select
                  value={form["INSTITUTE NAME"]}
                  onChange={(e) => handleInstituteChange(e.target.value)}
                  disabled={spocFieldsDisabled} // ✅ MODIFIED
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all disabled:cursor-not-allowed disabled:bg-gray-200"
                >
                  <option value="">Select your institute...</option>
                  {spocData.map((spoc) => (
                    <option
                      key={spoc["Institution Name"] + spoc["SPOC Name"]}
                      value={spoc["Institution Name"]}
                    >
                      {spoc["Institution Name"]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SPOC Name
                </label>
                <input
                  type="text"
                  value={form["SPOC NAME"]}
                  readOnly
                  disabled={spocFieldsDisabled} // ✅ MODIFIED
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed disabled:cursor-not-allowed disabled:bg-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SPOC Email
                </label>
                <input
                  type="email"
                  value={form["SPOC EMAIL"]}
                  readOnly
                  disabled={spocFieldsDisabled} // ✅ MODIFIED
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed disabled:cursor-not-allowed disabled:bg-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SPOC Phone
                </label>
                <input
                  type="tel"
                  value={form["SPOC PHONE"]}
                  readOnly
                  disabled={spocFieldsDisabled} // ✅ MODIFIED
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed disabled:cursor-not-allowed disabled:bg-gray-200"
                />
              </div>
            </div>
          </div>
          {/* ✅ END: SPOC Information Section */}

        </div>

        {/* Day Selection */}
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
          <h3 className="text-lg font-medium text-indigo-800 mb-3">
            Select Days to Attend
          </h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.attend_day1}
                onChange={(e) => handleInput("attend_day1", e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <span className="font-medium">Day 1</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.attend_day2}
                onChange={(e) => handleInput("attend_day2", e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <span className="font-medium">Day 2</span>
            </label>
          </div>
          {(!form.attend_day1 && !form.attend_day2) && (
            <p className="text-red-500 text-sm mt-2">Please select at least one day to attend</p>
          )}
        </div>

        {/* Fee Explanation */}
        {getFeeExplanation()}
      </section>

      {/* ... (Rest of the file: Event Selection, Rules, Payment Summary, Modal) ... */}
      {/* ... (No changes are needed in the rest of the file) ... */}


      {/* Event Selection */}
      <section className="mt-8 sm:mt-12">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-indigo-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-2 sm:mb-0">
              <span className="mr-2">🎯</span> Select Events
            </h2>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Day Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => switchDay("1")}
              className={`py-2 px-4 font-medium transition-all ${
                activeDay === "1"
                  ? "border-b-2 border-indigo-500 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Day 1 {!form.attend_day1 && <span className="text-amber-500 text-xs">(Not Attending)</span>}
            </button>
            <button
              onClick={() => switchDay("2")}
              className={`py-2 px-4 font-medium transition-all ${
                activeDay === "2"
                  ? "border-b-2 border-indigo-500 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Day 2 {!form.attend_day2 && <span className="text-amber-500 text-xs">(Not Attending)</span>}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredEvents.map((event) => {
              const eventId = String(event.id);
              // Determine if this event should have a special indicator (free for NIT students)
              const isFreeForNIT = form.is_nit_student && 
                
                !isHauntedHouseEvent(event);
              
              // Check if this event is from a day the user isn't attending
              const eventDay = event.day;
              const dayNotSelected = (eventDay.includes("1") && !form.attend_day1) || 
                                     (eventDay.includes("2") && !form.attend_day2);
              
              return (
                <label
                  key={eventId}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    form.selected_events.includes(eventId)
                      ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200"
                      : dayNotSelected 
                        ? "bg-gray-100 border-gray-200 opacity-60" 
                        : "bg-white border-gray-200 hover:border-indigo-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                      checked={form.selected_events.includes(eventId)}
                      onChange={() => toggleEvent(event.id)}
                    />
                    <div>
                      <h3 className="font-bold text-lg text-indigo-900">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {event.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Category:</span> {event.sub_category}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-indigo-600">
                          Fee: {isFreeForNIT ? (
                            <span className="text-green-600">Free for NIT Students</span>
                          ) : (
                            <span>₹{event.fee}</span>
                          )}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                          Day {event.day}
                        </span>
                      </div>
                      {dayNotSelected && (
                        <p className="text-xs text-amber-600 mt-1">
                          Note: Selecting this event will add Day {event.day} to your registration
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rules Agreement */}
      <section className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-indigo-100">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agree_to_rules"
            className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            checked={form.agree_to_rules}
            onChange={(e) => handleInput("agree_to_rules", e.target.checked)}
          />
          <div>
            <label htmlFor="agree_to_rules" className="font-medium text-gray-700">
              I agree to the event rules and guidelines
            </label>
            <p className="text-sm text-gray-500 mt-1">
              By checking this box, you confirm that you have read and agree to follow all 
              <a 
                href="#" 
                onClick={handleRulesClick}
                className="text-indigo-600 underline ml-1 hover:text-indigo-800 transition-colors"
              >
                event rules and regulations
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Final Fee Summary Card */}
      <section className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-lg text-white">
        <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-white bg-opacity-90 rounded-lg p-3 text-gray-900">
            <p className="text-sm text-gray-700">Events Fee</p>
            <p className="text-2xl font-bold">₹{eventsFee}</p>
            {form.is_nit_student && (
              <p className="text-xs text-green-600 mt-1">
                *Only haunted house
              </p>
            )}
          </div>
          <div className="bg-white bg-opacity-90 rounded-lg p-3 text-gray-900">
            <p className="text-sm text-gray-700">Entry Fee</p>
            <p className="text-2xl font-bold">₹{entryFee}</p>
            {!form.is_nit_student && entryFee > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                *One-time fee
              </p>
            )}
          </div>
          <div className="bg-white bg-opacity-90 rounded-lg p-3 text-gray-900">
            <p className="text-sm text-gray-700">Total Fee</p>
            <p className="text-2xl font-bold">₹{totalFee}</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={handleSubmit}
            className="bg-white text-indigo-700 text-lg px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 font-bold"
          >
            ✅ Proceed to Payment
          </button>
        </div>
      </section>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl max-h-[80vh] overflow-y-auto w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-900">Event Rules and Regulations</h2>
              <button 
                onClick={handleCloseRules}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all"
              >
                ✕
              </button>
            </div>
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-indigo-800 border-b pb-2 mb-4">
                Range-e-Chinar 2.0 Event Rules
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Identification Requirements</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>All participants must carry a valid government-issued ID (Aadhar, PAN, Driving License). Entry will be granted only after verification at the registration/security desk.</li>
                    <li>Students without their college/school ID cards are not allowed inside.</li>
                    <li>Presenting fake ID to access the event or avoid applicable fees is strictly prohibited.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Entry Fee Details</h4>
                  <p className="text-sm text-gray-600 mb-2">The following is a one-time entry fee for external participants, valid for one or both days:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>School Students (till Class 10) – Rs.20</li>
                    <li>College Students (Including Class 11 & 12) – Rs.29</li>
                    <li>NIT alumni – Rs.299</li>
                    <li>Others (With Any govt ID) – Rs.999</li>
                    <li className="text-green-700 font-medium">*NIT students participate in most events for free, except haunted house (no entry fee).</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Entry Band Rules</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Participants must wear their bands provided during registration at all times.</li>
                    <li>If participants leave the campus during the event, they must remove the previous band and register and pay again to get a new band.</li>
                    <li>Participants attending both days will receive separate bands for Day 1 and Day 2 after paying the single entry fee.</li>
                    <li>The institution is not responsible for replacing lost or damaged bands.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Game Zone Registration</h4>
                  <p>
                    Participants registering for game zone activities must pay a separate registration fee at the game zone registration desk available near the main gate and Chinar premises (in addition to the entry fee).
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Prohibited Items</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Sharp objects</li>
                    <li>Weapons of any kind</li>
                    <li>Fireworks or explosives</li>
                    <li>Alcoholic beverages or illegal substances</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Safety and Security</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Security personnel have the right to inspect bags or belongings at entry points.</li>
                    <li>Follow all instructions given by security staff and volunteers.</li>
                    <li>The organizers are not responsible for loss of personal belongings.</li>
                    <li>In case of emergencies, follow announcements and emergency evacuation plans.</li>
                    <li>Report any suspicious activity or unattended bags to security personnel immediately.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Conduct Policy</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Participants must maintain discipline and respectful behavior throughout the event.</li>
                    <li>Any form of harassment, abuse, or physical altercation will result in immediate disqualification and removal.</li>
                    <li>Avoid damage to event property, decorations, or any campus infrastructure.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Violations</h4>
                  <p>Violations of these rules may result in:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Immediate removal from the event premises</li>
                    <li>Reporting to local authorities (in serious cases)</li>
                    <li>Disqualification from participation or award</li>
                    <li>Accountability for damages</li>
                  </ul>
                </div>
              </div>

              <p className="mt-6 pt-4 border-t text-gray-700 italic">
                <strong>Note:</strong> The organizing committee reserves the right to make changes to the rules and schedule as needed. Any updates will be communicated to registered participants.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
// export default function Page() {
//   return <div style={{ height: '100px' }}>Registrations are Temporarily closed , will reopen soon....</div>
// }