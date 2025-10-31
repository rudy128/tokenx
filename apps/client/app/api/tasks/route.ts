import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { withAuth } from "@/lib/auth-helpers"


export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/tasks called');
  
  try {
    console.log('📝 Parsing request body...');
    const body = await request.json();
    console.log('✅ Body parsed successfully:', Object.keys(body));
    
    console.log('🔍 Validating required fields...');
    if (!body.taskName?.trim()) {
      console.log('❌ Task name missing');
      return NextResponse.json(
        { success: false, message: 'Task name is required' },
        { status: 400 }
      );
    }

    if (!body.description?.trim()) {
      console.log('❌ Description missing');
      return NextResponse.json(
        { success: false, message: 'Task description is required' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');
    console.log('🔨 Creating task data...');
    
    const taskData = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskName: body.taskName,
      description: body.description,
      instructions: body.instructions || '',
      finalXp: body.xp === 'custom' ? parseInt(body.customXp) || 0 : body.xp,
      frequency: body.frequency || 'one-time',
      evidenceMode: body.evidenceMode || 'manual',
      requiredFields: body.requiredFields || {},
      status: 'draft',
      createdAt: new Date().toISOString(),
      campaignId: body.campaignId || 'default-campaign'
    };

    console.log('✅ Task data created:', taskData.id);

    return NextResponse.json({
      success: true,
      data: taskData,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('❌ Error in POST /api/tasks:', error);
    console.error('❌ Error stack:', (error as Error).stack);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create task',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('🚀 GET /api/tasks called');
  
  try {
    const mockTasks = [
      {
        id: 'task_1',
        taskName: 'Test Task',
        description: 'Test Description',
        finalXp: 10,
        status: 'active'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockTasks
    });
  } catch (error) {
    console.error('❌ Error in GET /api/tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
