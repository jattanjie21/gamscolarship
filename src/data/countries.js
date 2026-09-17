// Study-abroad destination information. General, non-binding overview only —
// visa rules and scholarship availability change often, so each country
// links to an official source for current requirements.

const countries = [
  {
    id: 'uk',
    name: 'United Kingdom',
    overview:
      'Home to globally ranked universities and a wide range of scholarship schemes such as Chevening and Commonwealth Scholarships.',
    popularOptions: ["Master's degrees (1 year)", 'Undergraduate degrees (3 years)', 'Research degrees'],
    scholarshipNotes:
      'Several government and university-funded scholarships exist for international students; check eligibility carefully as most require a confirmed university offer first.',
    admissionNotes:
      'Typically requires academic transcripts, English language proficiency (IELTS/TOEFL), a personal statement, and references.',
    usefulLink: 'https://www.gov.uk/student-visa',
  },
  {
    id: 'canada',
    name: 'Canada',
    overview:
      'Known for affordable, high-quality education and post-study work opportunities compared to some other destinations.',
    popularOptions: ['Undergraduate programs', "Master's programs", 'College diplomas'],
    scholarshipNotes:
      'Scholarships vary widely by province and institution; many are merit-based and awarded directly by universities.',
    admissionNotes:
      'Requires a study permit application in addition to university admission; processing times can vary.',
    usefulLink: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html',
  },
  {
    id: 'us',
    name: 'United States',
    overview:
      'Offers an enormous range of institutions and programs, from community colleges to research universities.',
    popularOptions: ['Undergraduate degrees', "Master's degrees", 'PhD programs with funding/assistantships'],
    scholarshipNotes:
      'Some universities offer need-based or merit-based financial aid to international students; availability varies significantly by school.',
    admissionNotes:
      'Requires standardized tests depending on the program (e.g., SAT, GRE, TOEFL/IELTS) and an F-1 student visa.',
    usefulLink: 'https://educationusa.state.gov/',
  },
  {
    id: 'germany',
    name: 'Germany',
    overview:
      'Public universities charge little to no tuition for many programs, and DAAD offers scholarships to international students.',
    popularOptions: ['Undergraduate and graduate programs (many taught in English)', 'Research degrees'],
    scholarshipNotes:
      'DAAD is a major source of funding for postgraduate and development-related study; check program-specific deadlines.',
    admissionNotes:
      'May require proof of German or English proficiency depending on the program, and a national visa for longer stays.',
    usefulLink: 'https://www.daad.de/en/',
  },
  {
    id: 'france',
    name: 'France',
    overview:
      'Offers a mix of public universities and grandes écoles, with growing numbers of English-taught programs.',
    popularOptions: ["Bachelor's and master's degrees", 'Engineering and business programs'],
    scholarshipNotes:
      'Eiffel Excellence Scholarship and Campus France resources can help identify funding options.',
    admissionNotes:
      'Applications for many programs go through Campus France in the applicant\'s home country.',
    usefulLink: 'https://www.campusfrance.org/en',
  },
  {
    id: 'turkey',
    name: 'Turkey',
    overview:
      'Turkiye Burslari offers fully funded scholarships covering a wide range of study levels for international students.',
    popularOptions: ['Undergraduate, master\'s, and PhD programs', 'Turkish language preparation year'],
    scholarshipNotes:
      'Turkiye Burslari applications open annually with country-specific and general quotas.',
    admissionNotes:
      'Age limits and academic requirements vary by study level; check official guidance each cycle.',
    usefulLink: 'https://www.turkiyeburslari.gov.tr/',
  },
  {
    id: 'china',
    name: 'China',
    overview:
      'Chinese Government Scholarships and university-specific scholarships support many international students each year.',
    popularOptions: ["Bachelor's, master's, and PhD programs", 'Chinese language study'],
    scholarshipNotes:
      'Scholarships may be applied for through Chinese embassies or directly through participating universities.',
    admissionNotes:
      'Some programs are taught in Chinese; language requirements vary by university and program.',
    usefulLink: 'https://www.campuschina.org/',
  },
  {
    id: 'australia',
    name: 'Australia',
    overview:
      'Australia Awards and university scholarships support students from a number of partner countries.',
    popularOptions: ["Master's degrees", 'Vocational and undergraduate programs'],
    scholarshipNotes:
      'Australia Awards typically prioritize applicants from designated partner countries and development-related fields.',
    admissionNotes:
      'A student visa (subclass 500) and confirmation of enrolment (CoE) are required before travel.',
    usefulLink: 'https://www.dfat.gov.au/people-to-people/australia-awards',
  },
];

export default countries;
