import { TaskType } from "./task-types"
import { moderateContent } from "./content-moderation"
import { prisma } from "./prisma"

async function updateSubmissionStatus(submissionId: string, isApproved: boolean, reason?: string) {
  try {
    // Update TaskSubmission with the new status
    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: isApproved ? 'APPROVED' : 'REJECTED',
        // Note: TaskSubmission doesn't have rejectionReason or processedAt fields
      }
    })
    console.log(`💾 Updated TaskSubmission ${submissionId}: ${isApproved ? 'APPROVED' : 'REJECTED'}${reason ? ` - ${reason}` : ''}`)
  } catch (error) {
    console.error(`❌ Failed to update submission ${submissionId}:`, error)
  }
}

export async function runTwitterVerification(postUrl: string, twitterHandle: string, taskType: TaskType, submissionId: string) {
  console.log(`🚀 Starting non-blocking Twitter verification for ${taskType}, submission: ${submissionId}`)
  console.log(`   Twitter Handle: ${twitterHandle} (for result verification)`)
  
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
        url: postUrl 
      })
    })
    
    const data = await response.json()
    console.log(`📊 Twitter API response:`, JSON.stringify(data, null, 2))
    
    // Normalize Twitter handle (remove @ if present)
    const normalizedHandle = twitterHandle.replace('@', '')
    console.log(`🔍 Looking for username: "${normalizedHandle}" in response`)
    
    // Check if response contains arrays (likes, reposts, quotes, comments)
    if (data.likers && Array.isArray(data.likers)) {
      console.log(`   Found ${data.likers.length} likers`)
      const found = data.likers.some((user: any) => user.username === normalizedHandle)
      console.log(`✅ LIKE verification result: ${taskType} - ${found}`)
      await updateSubmissionStatus(submissionId, found, found ? undefined : 'User did not like the post')
    } else if (data.reposts && Array.isArray(data.reposts)) {
      console.log(`   Found ${data.reposts.length} reposts`)
      const found = data.reposts.some((user: any) => user.username === normalizedHandle)
      console.log(`✅ RT verification result: ${taskType} - ${found}`)
      await updateSubmissionStatus(submissionId, found, found ? undefined : 'User did not repost the tweet')
    } else if (data.quotes && Array.isArray(data.quotes)) {
      console.log(`   Found ${data.quotes.length} quotes`)
      const found = data.quotes.some((user: any) => user.username === normalizedHandle)
      console.log(`✅ QT verification result: ${taskType} - ${found}`)
      await updateSubmissionStatus(submissionId, found, found ? undefined : 'User did not quote the tweet')
    } else if (data.comments && Array.isArray(data.comments)) {
      console.log(`   Found ${data.comments.length} comments`)
      const userComment = data.comments.find((comment: any) => comment.username === normalizedHandle)
      if (userComment) {
        console.log(`💬 Found user comment: ${userComment.text}`)
        const moderation = await moderateContent(userComment.text)
        console.log(`✅ CMNT verification result: ${taskType} - ${moderation.isValid}`)
        await updateSubmissionStatus(submissionId, moderation.isValid, moderation.reason)
      } else {
        console.log(`❌ CMNT verification result: ${taskType} - false (comment not found)`)
        console.log(`   Expected username: "${normalizedHandle}"`)
        if (data.comments.length > 0) {
          console.log(`   Available usernames:`, data.comments.map((c: any) => c.username).join(', '))
        }
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
