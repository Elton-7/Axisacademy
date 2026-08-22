'use strict'

const { Op } = require('sequelize')

/**
 * Gives each coordinator a sentence saying what they are responsible for.
 *
 * The team cards had a name, a job title and a category chip and nothing else,
 * because every descriptive field on the record was empty. A parent reading
 * "CBC Junior Secondary Coordinator" has to already know what that means.
 *
 * Each line below is drawn from the coordinator's own job title and nothing
 * else. No qualification, institution or length of service is stated for
 * anyone, because none of that has been supplied and inventing it on a page
 * that families use to judge whether to trust Axis with a child would be
 * indefensible. Axis should review the wording, and can edit any of it from
 * the CMS.
 *
 * Only empty biographies are filled, so anything Axis has already written is
 * left alone, and the down migration removes only the exact text it added.
 */
const RESPONSIBILITIES = {
  'Amelie Mussard':
    'Leads the foreign language programmes, matching learners to the right language and level and overseeing how those languages are taught across Axis.',
  'Humber Masese':
    'Runs sports and physical development, planning the activity side of a learner’s week so that physical growth is part of the programme rather than an extra.',
  'Victor Muyekwe':
    'Leads the performing arts — drama, music and performance — and builds them into learners’ programmes as a way of developing confidence and expression.',
  'Ajok Deng':
    'Leads the creative arts, guiding learners through visual and practical creative work and supporting those whose strengths show first in what they make.',
  'Sunkuli Lerionka':
    'Develops learners’ communication and leadership: speaking clearly, listening well, and taking responsibility in a group.',
  'Ashley Ndanu':
    'Leads technology and innovation, from digital skills to the platforms used for online learning, and keeps that side of the programme current.',
  'Yoshira Audrey':
    'Coordinates inclusive learning for sensory and physical disabilities, adapting how a programme is delivered so the learner can access it fully.',
  'Naomie Kalachi':
    'Coordinates integrated learning for severe and intellectual disabilities, shaping programmes around each learner’s own pace and goals.',
  'Wendy Claudia':
    'Leads the Montessori infant and toddler stage, where the emphasis is on early independence, movement and language.',
  'Tabitha Wachira':
    'Leads Montessori early childhood, guiding the years where curiosity is turned into habits of independent work.',
  'Fikirini Juma':
    'Leads the Montessori elementary stage, where learners begin working from their own questions and following them through.',
  'Collins Isa':
    'Leads Montessori secondary, supporting learners through the transition into more formal academic work.',
  'Gloria Lakeiisha':
    'Coordinates CBC pre-primary, overseeing the earliest stage of the competency-based curriculum.',
  'Mulati Mike':
    'Coordinates CBC lower primary, where foundational literacy and numeracy are established.',
  'Adura Moses':
    'Coordinates CBC upper primary, carrying learners through to the end of the primary phase.',
  'Martha Wesonga':
    'Coordinates CBC junior secondary, guiding learners and families through pathway choices at this stage.',
  'Felistus Chepkemoi':
    'Coordinates CBC senior secondary, overseeing the final school phase and preparation for what follows it.',
  'Laban Kagiri':
    'Coordinates Cambridge Early Years, the first stage of the Cambridge pathway.',
  'Daisy Luvanda':
    'Coordinates Cambridge Primary, overseeing curriculum delivery and progress through the primary stages.',
  'Warren Ndaro':
    'Coordinates Cambridge Lower Secondary, bridging primary work and formal examination courses.',
  'Victory Adikinyi':
    'Coordinates Cambridge Upper Secondary, overseeing IGCSE and O Level preparation and examination readiness.',
}

module.exports = {
  async up(queryInterface) {
    for (const [name, biography] of Object.entries(RESPONSIBILITIES)) {
      await queryInterface.bulkUpdate(
        'educators',
        { biography, updatedAt: new Date() },
        {
          name,
          [Op.or]: [{ biography: null }, { biography: '' }],
        }
      )
    }
  },

  async down(queryInterface) {
    for (const [name, biography] of Object.entries(RESPONSIBILITIES)) {
      await queryInterface.bulkUpdate('educators', { biography: null, updatedAt: new Date() }, { name, biography })
    }
  },
}
