// Sample/demo scholarship data for GamScholarship.
// NOTE: These entries are marked isSample: true and exist to demonstrate
// the site's layout and filtering features. Replace with verified,
// real opportunities (with official source links) before going live.
//
// Shape of a scholarship object:
// {
//   id, title, organization, country, level, funding, field,
//   deadline (YYYY-MM-DD), status ("active" | "expired"),
//   description, eligibility[], requirements[], benefits[],
//   applicationUrl, isSample
// }

const scholarships = [
  {
    id: 1,
    title: 'Chevening Scholarships',
    organization: 'UK Government (FCDO)',
    country: 'United Kingdom',
    level: "Master's",
    funding: 'Fully Funded',
    field: 'All fields',
    deadline: '2026-11-03',
    status: 'active',
    description:
      'A UK government global scholarship programme funding one-year master\'s degrees for future leaders, including applicants from The Gambia.',
    eligibility: [
      'Citizen of a Chevening-eligible country, including The Gambia',
      'Return to home country for at least two years after the award',
      'At least two years of work experience',
    ],
    requirements: [
      'Completed online application',
      'Three unconditional master\'s course offers from UK universities',
      'Two references',
    ],
    benefits: [
      'Full tuition fees',
      'Monthly stipend',
      'Travel costs to and from the UK',
    ],
    applicationUrl: 'https://www.chevening.org/',
    isSample: true,
  },
  {
    id: 2,
    title: 'Mastercard Foundation Scholars Program',
    organization: 'Mastercard Foundation',
    country: 'Multiple (Africa-focused)',
    level: 'Undergraduate',
    funding: 'Fully Funded',
    field: 'All fields',
    deadline: '2027-01-15',
    status: 'active',
    description:
      'Supports academically talented but economically disadvantaged young people from Africa to access quality secondary and university education.',
    eligibility: [
      'Demonstrated financial need',
      'Strong academic record',
      'Commitment to giving back to community',
    ],
    requirements: [
      'Apply through a partner university or program',
      'Academic transcripts',
      'Personal statement',
    ],
    benefits: [
      'Tuition and fees',
      'Accommodation and living stipend',
      'Mentorship and leadership training',
    ],
    applicationUrl: 'https://mastercardfdn.org/all/scholars/',
    isSample: true,
  },
  {
    id: 3,
    title: 'DAAD Scholarships for Development-Related Postgraduate Courses',
    organization: 'German Academic Exchange Service (DAAD)',
    country: 'Germany',
    level: "Master's",
    funding: 'Fully Funded',
    field: 'Development, Economics, Engineering',
    deadline: '2026-10-31',
    status: 'active',
    description:
      'Funds postgraduate study in Germany for students from developing countries in fields relevant to development policy.',
    eligibility: [
      'University degree, generally completed within the last 6 years',
      'At least two years of professional experience',
      'Citizen of a developing country',
    ],
    requirements: [
      'Online application via DAAD portal',
      'Letter of motivation',
      'Letters of recommendation',
    ],
    benefits: [
      'Monthly stipend',
      'Health, accident, and personal liability insurance',
      'Travel allowance',
    ],
    applicationUrl: 'https://www.daad.de/en/',
    isSample: true,
  },
  {
    id: 4,
    title: 'Turkiye Burslari (Turkey Scholarships)',
    organization: 'Government of Turkey',
    country: 'Turkey',
    level: 'Undergraduate, Master\'s, PhD',
    funding: 'Fully Funded',
    field: 'All fields',
    deadline: '2027-02-20',
    status: 'active',
    description:
      'A government scholarship covering tuition, accommodation, and living costs for international students, including from The Gambia, to study in Turkey.',
    eligibility: [
      'Meet minimum academic requirements for the chosen level',
      'Meet age limits set for each study level',
    ],
    requirements: [
      'Online application via turkiyeburslari.gov.tr',
      'Academic transcripts',
      'Passport or ID',
    ],
    benefits: [
      'Tuition fees',
      'Monthly stipend',
      'Accommodation',
      'One-way flight ticket',
      'Turkish language course',
    ],
    applicationUrl: 'https://www.turkiyeburslari.gov.tr/',
    isSample: true,
  },
  {
    id: 5,
    title: 'Australia Awards Scholarships',
    organization: 'Australian Government',
    country: 'Australia',
    level: "Master's",
    funding: 'Fully Funded',
    field: 'All fields',
    deadline: '2026-12-01',
    status: 'active',
    description:
      'Long-term development scholarships administered by the Australian Government for students from eligible partner countries.',
    eligibility: [
      'Citizen of an eligible partner country',
      'Meet the minimum entry requirements for study in Australia',
    ],
    requirements: [
      'Online application',
      'Academic records',
      'English language proficiency test results',
    ],
    benefits: [
      'Full tuition fees',
      'Return air travel',
      'Establishment allowance',
      'Living expenses',
    ],
    applicationUrl: 'https://www.dfat.gov.au/people-to-people/australia-awards',
    isSample: true,
  },
  {
    id: 6,
    title: 'Commonwealth Shared Scholarships',
    organization: 'Commonwealth Scholarship Commission (UK)',
    country: 'United Kingdom',
    level: "Master's",
    funding: 'Fully Funded',
    field: 'Development-related fields',
    deadline: '2026-11-20',
    status: 'active',
    description:
      'Funded master\'s study in the UK for students from developing Commonwealth countries who would not otherwise be able to study in the UK.',
    eligibility: [
      'Citizen of, or have been granted refugee status by, an eligible Commonwealth country',
      'Be unable to afford to study in the UK without this scholarship',
    ],
    requirements: [
      'Apply through a UK university offering Shared Scholarships',
      'Academic transcripts',
      'References',
    ],
    benefits: [
      'Tuition fees',
      'Return airfare',
      'Monthly stipend',
    ],
    applicationUrl: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships/',
    isSample: true,
  },
  {
    id: 7,
    title: 'Fulbright Foreign Student Program',
    organization: 'U.S. Department of State',
    country: 'United States',
    level: "Master's, PhD",
    funding: 'Fully Funded',
    field: 'All fields (except clinical medicine)',
    deadline: 'Varies by country — check your local U.S. Embassy/Fulbright Commission',
    status: 'active',
    description:
      'Flagship U.S. government exchange program funding graduate study and research in the United States. Application deadlines are set individually by each country\'s U.S. Embassy or Fulbright Commission, so exact dates vary widely (commonly between February and October).',
    eligibility: [
      'Citizen of an eligible country outside the United States',
      'Hold a bachelor\'s degree or equivalent',
      'Meet the specific requirements set by your country\'s U.S. Embassy or Fulbright Commission',
    ],
    requirements: [
      'Online application through the relevant U.S. Embassy or Fulbright Commission',
      'Academic transcripts and degree certificates',
      'Statement of grant purpose and letters of recommendation',
    ],
    benefits: [
      'Tuition and fees',
      'Monthly living stipend',
      'Round-trip airfare',
      'Health insurance',
    ],
    applicationUrl: 'https://foreign.fulbrightonline.org/',
    isSample: false,
  },
  {
    id: 8,
    title: 'MEXT Scholarship (Embassy Recommendation)',
    organization: 'Government of Japan (MEXT)',
    country: 'Japan',
    level: 'Undergraduate, Master\'s, PhD',
    funding: 'Fully Funded',
    field: 'All fields',
    deadline: 'Varies by country — check with your local Japanese Embassy',
    status: 'active',
    description:
      'Japan\'s government scholarship covering tuition, a monthly stipend, and airfare for international students. Applications are submitted through the Japanese Embassy or Consulate in the applicant\'s home country, and deadlines differ by country (commonly between December and June).',
    eligibility: [
      'Meet the age and academic requirements for the chosen study level',
      'Be nominated by a Japanese Embassy/Consulate or a Japanese university',
    ],
    requirements: [
      'Application form and required documents submitted to the local Japanese Embassy',
      'Academic transcripts',
      'Certificate of health',
    ],
    benefits: [
      'Tuition fees waived',
      'Monthly stipend',
      'Round-trip airfare',
    ],
    applicationUrl: 'https://www.studyinjapan.go.jp/en/smap-stopj-applications-japanese.html',
    isSample: false,
  },
  {
    id: 9,
    title: 'Gates Cambridge Scholarship',
    organization: 'Gates Cambridge Trust / University of Cambridge',
    country: 'United Kingdom',
    level: "Master's, PhD",
    funding: 'Fully Funded',
    field: 'All fields',
    deadline: '2027-01-06',
    status: 'active',
    description:
      'A highly competitive scholarship for outstanding postgraduate applicants from outside the UK to study any full-time postgraduate course at the University of Cambridge. Most non-US applicants fall under the January round; some courses use an earlier December round, and US citizens resident in the US apply in October.',
    eligibility: [
      'Citizen of any country outside the United Kingdom',
      'Applying for an eligible full-time postgraduate course at Cambridge',
      'Demonstrated academic excellence and leadership potential',
    ],
    requirements: [
      'Apply for admission and funding via the Cambridge Graduate Application Portal',
      'Complete the Gates Cambridge section of the funding application',
      'Personal statement and academic references',
    ],
    benefits: [
      'Full tuition (University Composition Fee)',
      'Maintenance allowance',
      'One economy return airfare',
      'Immigration Health Surcharge and visa costs',
    ],
    applicationUrl: 'https://www.gatescambridge.org/apply/timeline/',
    isSample: false,
  },
];

export default scholarships;
