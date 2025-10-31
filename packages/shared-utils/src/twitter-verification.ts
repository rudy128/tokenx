import { TaskType } from "./task-types"
import { moderateContent } from "./content-moderation"
import { prisma } from "./prisma"

async function updateSubmissionStatus(submissionId: string, isApproved: boolean, reason?: string) {
  try {
    await prisma.newTaskSubmission.update({
      where: { id: submissionId },
      data: {
        status: isApproved ? 'approved' : 'rejected',
        rejectionReason: isApproved ? null : reason,
        processedAt: new Date()
      }
    })
    console.log(`💾 Updated submission ${submissionId}: ${isApproved ? 'APPROVED' : 'REJECTED'}${reason ? ` - ${reason}` : ''}`)
  } catch (error) {
    console.error(`❌ Failed to update submission ${submissionId}:`, error)
  }
}

export async function runTwitterVerification(postUrl: string, twitterHandle: string, taskType: TaskType, submissionId: string) {
  console.log(`🚀 Starting non-blocking Twitter verification for ${taskType}, submission: ${submissionId}`)
  
  // Run verification without blocking
  verifyTwitterTask(postUrl, twitterHandle, taskType, submissionId)
    .then(() => console.log(`✅ Twitter verification completed for ${taskType}`))
    .catch(error => console.error(`❌ Twitter verification error for ${taskType}:`, error))
  
  console.log(`💫 Twitter verification started in background for ${taskType}`)
}

// Twitter API Endpoints Directory
export const TWITTER_ENDPOINTS = {
  'LIKE': '/twitter/post/likes',
  'RT': '/twitter/post/reposts',
  'QT': '/twitter/post/quotes',
  'CMNT': '/twitter/post/comments',
  'OT': '/twitter/post'
} as const

export async function verifyTwitterTask(postUrl: string, twitterHandle: string, taskType: TaskType, submissionId: string) {
  const endpoint = TWITTER_ENDPOINTS[taskType as keyof typeof TWITTER_ENDPOINTS] || '/twitter/post'
  const fullUrl = `${process.env.TWITTER_URL}${endpoint}`
  
  console.log(`🐦 Starting Twitter verification - TaskType: ${taskType}, Handle: ${twitterHandle}, URL: ${postUrl}`)
  console.log(`🔗 Calling endpoint: ${fullUrl}`)
  
  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TWITTER_API_KEY}`
      },
      body: JSON.stringify({ 
        username: twitterHandle,
        url: postUrl 
      })
    })
    
    const data = await response.json()
    console.log(`📊 Twitter API response:`, JSON.stringify(data, null, 2))
    
    // Check if response contains arrays (likes, reposts, quotes, comments)
    if (data.likers && Array.isArray(data.likers)) {
      const found = data.likers.some((user: any) => user.username === twitterHandle.replace('@', ''))
      console.log(`✅ LIKE verification result: ${taskType} - ${found}`)
      await updateSubmissionStatus(submissionId, found, found ? undefined : 'User did not like the post')
    } else if (data.reposts && Array.isArray(data.reposts)) {
      const found = data.reposts.some((user: any) => user.username === twitterHandle.replace('@', ''))
      console.log(`✅ RT verification result: ${taskType} - ${found}`)
      await updateSubmissionStatus(submissionId, found, found ? undefined : 'User did not repost the tweet')
    } else if (data.quotes && Array.isArray(data.quotes)) {
      const found = data.quotes.some((user: any) => user.username === twitterHandle.replace('@', ''))
      console.log(`✅ QT verification result: ${taskType} - ${found}`)
      await updateSubmissionStatus(submissionId, found, found ? undefined : 'User did not quote the tweet')
    } else if (data.comments && Array.isArray(data.comments)) {
      const userComment = data.comments.find((comment: any) => comment.username === twitterHandle.replace('@', ''))
      if (userComment) {
        console.log(`💬 Found user comment: ${userComment.text}`)
        const moderation = await moderateContent(userComment.text)
        console.log(`✅ CMNT verification result: ${taskType} - ${moderation.isValid}`)
        await updateSubmissionStatus(submissionId, moderation.isValid, moderation.reason)
      } else {
        console.log(`❌ CMNT verification result: ${taskType} - false (comment not found)`)
        await updateSubmissionStatus(submissionId, false, 'User comment not found')
      }
    } else if (taskType === 'OT' && data.text) {
      console.log(`📝 Found tweet content: ${data.text}`)
      const moderation = await moderateContent(data.text)
      console.log(`✅ OT verification result: ${taskType} - ${moderation.isValid}`)
      await updateSubmissionStatus(submissionId, moderation.isValid, moderation.reason)
    } else {
      console.log(`ℹ️ Default verification result: ${taskType}`)
      await updateSubmissionStatus(submissionId, true)
    }
  } catch (error) {
    console.error(`❌ Twitter verification failed for ${taskType}:`, error)
  }
}


