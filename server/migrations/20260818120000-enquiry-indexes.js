/**
 * Indexes for the queries that read the enquiry pipeline.
 *
 * `enrollments` had nothing but its primary key, while three routes scan it on
 * every call: the pipeline summary groups by stage, the retention report
 * filters on age and stage together, and the admin list orders by creation
 * date. `contacts` is filtered by age by the same retention report.
 *
 * Harmless at today's volumes and increasingly not so — this is exactly the
 * kind of change `sync({})` cannot make to an existing table, which is why the
 * migration runner exists.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('enrollments', ['pipelineStage'], {
      name: 'enrollments_pipeline_stage_idx',
    })
    await queryInterface.addIndex('enrollments', ['createdAt'], {
      name: 'enrollments_created_at_idx',
    })
    // The retention sweep filters on both together.
    await queryInterface.addIndex('enrollments', ['pipelineStage', 'createdAt'], {
      name: 'enrollments_stage_created_idx',
    })
    await queryInterface.addIndex('contacts', ['createdAt'], {
      name: 'contacts_created_at_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('enrollments', 'enrollments_pipeline_stage_idx')
    await queryInterface.removeIndex('enrollments', 'enrollments_created_at_idx')
    await queryInterface.removeIndex('enrollments', 'enrollments_stage_created_idx')
    await queryInterface.removeIndex('contacts', 'contacts_created_at_idx')
  },
}
