interface Env {
  DB: D1Database
}

const CLEANUP_CONFIG = {
  // Whether to delete expired emails
  DELETE_EXPIRED_EMAILS: true,
} as const 

const main = {
  async scheduled(_: ScheduledEvent, env: Env) {
    const now = Date.now()

    try {
      if (!CLEANUP_CONFIG.DELETE_EXPIRED_EMAILS) {
        console.log('Expired email deletion is disabled')
        return
      }
      // 清理过期邮箱
      const email_rst = await env.DB.prepare(`DELETE FROM email WHERE expires_at < ?`).bind(now).run()
      if (email_rst.success) {
        console.log(`Deleted ${email_rst?.meta?.changes ?? 0} expired emails and their associated messages`)
      } else {
        console.error('Failed to delete expired emails')
      }
      // 清理过期邮件
      const message_rst = await env.DB.prepare(`DELETE FROM message WHERE received_at < ?`).bind(now).run()
      if (message_rst.success) {
        console.log(`Deleted ${message_rst?.meta?.changes ?? 0} expired messages`)
      } else {
        console.error('Failed to delete expired messages')
      }
    } catch (error) {
      console.error('Failed to cleanup:', error)
      throw error
    }
  }
}

export default main
