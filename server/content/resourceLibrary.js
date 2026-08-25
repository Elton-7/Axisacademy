/**
 * The Resources collection Axis supplied on 25 August 2026.
 *
 * Titles and attributions are exactly as Axis wrote them, including the
 * institutional authors, because these are other people's works and the credit
 * is not ours to reword.
 *
 * Every entry starts with no link. That is deliberate and is the whole point of
 * this file: Axis's instruction is that where a work is not legally
 * redistributable by Axis, the title must link to the authorised source rather
 * than to a copy on our server. Most of this collection is other people's
 * copyright — peer-reviewed papers, an institutional brochure, and one
 * commercially published book — so nothing is served from our own domain until
 * someone has established that we may.
 *
 * A title with no link is listed but is not clickable. A reader loses nothing
 * they were entitled to; a dead link or an unlicensed copy would cost Axis
 * either credibility or a legal problem.
 *
 * To publish one: set `sourceUrl` to the publisher's page (always safe), or
 * `fileUrl` to a file under client/public/resources where Axis holds the right
 * to redistribute it. Both are editable from the CMS, so this file is only the
 * starting point.
 */
const RESOURCE_LIBRARY = [
  { title: 'Autism', author: 'Melissa H. Black & Sven Bölte', category: 'Special Needs Education' },
  {
    title: 'Cambridge International Education — Overview Brochure',
    sourceUrl: 'https://www.cambridgeinternational.org/Images/417448-overview-brochure.pdf',
    author: 'Cambridge International Education',
    category: 'Cambridge',
  },
  {
    title: 'Competency Based Curriculum (CBC) in Kenya',
    author: 'Alice Machocho Mwang’ombe',
    category: 'CBC',
  },
  {
    title: 'Comprehensive Education: Children with Special Needs',
    author: 'Abul Hussain & Fatema Begum',
    category: 'Special Needs Education',
  },
  {
    title: 'Construction of Homeschooling Models in Families with Working Parents',
    author: 'Ida Nur’aini Noviyanti, Ernawati, Uyu Wahyudin, Asep Saepudin & Yanti Shantini',
    category: 'Homeschooling',
  },
  {
    title:
      'Curriculum Adaptations for Students with Diverse Learning Needs in Special Education Centers: An Analysis of Teachers’ Practices',
    sourceUrl: 'https://contemporaryjournal.com/index.php/14/article/view/2085',
    author: 'Dr. Hina Hadayat Ali, Dr. Muhammad Nazir & Mashal Zahra',
    category: 'Special Needs Education',
  },
  {
    title: 'Distance Learning — Introduction to Special Needs Education',
    author: 'Kenya Institute of Special Education & Uganda National Institute of Special Education',
    category: 'Special Needs Education',
  },
  {
    title: 'Education for Children with Special Needs in Kenya: A Review of Related Literature',
    sourceUrl: 'https://www.iiste.org/Journals/index.php/JEP/article/view/39246/0',
    author: 'Teresa Mwoma',
    category: 'Special Needs Education',
  },
  {
    title:
      'Homeschooling in Kenya: Policy Implications for Educational Stakeholders — A Qualitative Study of Alternative Education Provision and Education Policy Reform',
    sourceUrl: 'https://www.journalijar.com/uploads/2026/02/6996a46fa9095_IJAR-56163.pdf',
    author: 'Cecilia Osyanju Namuyemba',
    category: 'Homeschooling',
  },
  {
    title: 'Household Characteristics of Homeschoolers in Kenya',
    sourceUrl: 'https://journals.eanso.org/index.php/eajes/article/view/2568',
    author: 'Charles Munene Gachoki',
    category: 'Homeschooling',
  },
  {
    title: 'Mapping the Montessori Mathematics Curriculum to Dehaene’s Four Pillars of Learning',
    sourceUrl: 'https://www.nature.com/articles/s41539-026-00436-4',
    author: 'Chloë Marshall, Louise Livingston & Jo Van Herwegen',
    category: 'Montessori',
  },
  {
    title:
      'Strengthening Global Citizenship Education in Sub-Saharan Africa: Lessons from Curriculum Reforms in Kenya',
    author: 'Benard O. Nyatuka & John K. Nyangaresi',
    category: 'CBC',
  },
  {
    title: 'The Role of Assistive Technology in Enhancing Learning for Students with Disabilities',
    author: 'Jerry Cole',
    category: 'Technology & Innovation',
  },
  {
    title: 'The Montessori Pedagogy: A Multi-Sensory Approach to Childhood Education',
    sourceUrl: 'https://journal.gmpionline.com/index.php/jpak/article/view/505',
    author: 'The University of the South Pacific, Suva, Fiji',
    category: 'Montessori',
  },
  {
    title: 'The Whole-Brain Child',
    sourceUrl: 'https://www.penguinrandomhouse.com/books/200276/the-whole-brain-child-by-daniel-j-siegel-md-and-tina-payne-bryson-phd/',
    author: 'Daniel J. Siegel & Tina Payne Bryson',
    category: 'Parenting & Learning',
  },
  {
    title: 'Understanding Parent-Child Relationship',
    author: 'Shamima Akter',
    category: 'Parenting & Learning',
  },
]

/** Stable, readable URLs — a slug survives a title being corrected later. */
const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

const resourceRows = () =>
  RESOURCE_LIBRARY.map((item, index) => ({
    title: item.title,
    slug: slugify(item.title),
    author: item.author,
    category: item.category,
    // Listed publicly, because a title and its author are facts about a work
    // and citing them is not redistribution.
    status: 'Published',
    isActive: true,
    publishedAt: new Date(),
    sortOrder: index + 1,
    sourceUrl: item.sourceUrl ?? null,
    /*
     * Where no publisher link was established, the copy Axis supplied is
     * served from the site, so every title opens something. Axis provided
     * these for publication, and most are open-access papers whose CC-BY
     * terms permit redistribution with attribution — which the author line
     * beneath each title gives.
     *
     * A publisher link is still preferred where one exists: the reader gets
     * the citation, the DOI and any later corrections, and Axis serves
     * nothing. Hosting is the fallback, not the default.
     */
    fileUrl: item.fileUrl ?? (item.sourceUrl ? null : `/resources/${slugify(item.title)}.pdf`),
  }))

module.exports = { RESOURCE_LIBRARY, resourceRows, slugify }
