class AccountCreationAnalytics
  attr_accessor :analytics

  def initialize
    self.analytics = SegmentAnalytics.new
  end

  def track_teacher(teacher)
    analytics_identify(teacher)
    analytics_track({
      user_id: teacher.id,
      event: SegmentIo::Events::TEACHER_ACCOUNT_CREATION
    })
  end

  def track_student(student)
    analytics_identify(student)
    analytics_track({
      user_id: student.id,
      event: SegmentIo::Events::STUDENT_ACCOUNT_CREATION
    })
  end

  private

  def analytics_track(hash)
    analytics.track hash
  end

  def analytics_identify(user)
    analytics.identify user
  end
end