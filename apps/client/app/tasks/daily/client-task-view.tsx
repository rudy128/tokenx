"use client";

import React, {useState, useEffect, useMemo} from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Clock, Flame, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Props task shape provided by server
export type ActiveTask = {
  id: string;
  title: string;
  description: string;
  xp: number;
  verificationMode: 'AUTO' | 'MANUAL' | string;
  submitted: boolean;
  submissionStatus?: 'submitted' | 'approved' | 'rejected' | null;
  rejectionReason?: string;
  submittedAt?: string;
  campaignName?: string;
  deadline?: string; // ISO
};

const pct = (value: number, max: number) => Math.min(100, Math.max(0, (value / max) * 100));

function TaskCard({ task, onDetailsClick, isPinned, onPinToggle }: { task: ActiveTask; onDetailsClick: () => void; isPinned: boolean; onPinToggle: () => void }) {
  const getStatusBadge = () => {
    if (!task.submitted) return null;
    
    switch (task.submissionStatus) {
      case 'approved':
        return <Badge className='bg-green-100 text-green-700 border-transparent'>Approved</Badge>;
      case 'rejected':
        return <Badge className='bg-red-100 text-red-700 border-transparent'>Rejected</Badge>;
      case 'submitted':
        return <Badge className='bg-yellow-100 text-yellow-700 border-transparent'>⏳ Under Review</Badge>;
      default:
        return <Badge className='bg-emerald-100 text-emerald-700 border-transparent'>Submitted</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between gap-4">
          <CardTitle className="text-sm font-semibold leading-snug">{task.title}</CardTitle>
          <Badge className={`text-white border-transparent px-2 py-0.5 text-[10px] font-semibold ${task.verificationMode === 'AUTO' ? 'bg-emerald-600' : 'bg-blue-600'}`}>{task.verificationMode}</Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{task.campaignName || '—'}</span>
            <span className="rounded-sm bg-muted px-2 py-0.5 text-foreground/70">XP: {task.xp}</span>
          </div>
          <Progress value={pct(task.submitted ? 1 : 0, 1)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant='secondary' className='bg-primary/10 text-primary border-transparent'>{task.xp} XP</Badge>
          {getStatusBadge()}
        </div>
        {task.submissionStatus === 'rejected' && task.rejectionReason && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
            <strong>Rejection Reason:</strong> {task.rejectionReason}
          </div>
        )}
        <div className='flex justify-between items-end gap-4'>
          <div className='text-[11px] font-medium flex items-center text-emerald-600'>
            <Clock size={14} className='mr-1' />{task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={onDetailsClick}>Details</Button>
            {!task.submitted ? (
              <Link href={`/tasks/daily/${task.id}`}>
                <Button size='sm'>Start Task</Button>
              </Link>
            ) : (
              <Button variant={isPinned ? 'destructive' : 'default'} size='sm' onClick={onPinToggle}>{isPinned ? 'Remove' : 'Add to Queue'}</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientTaskView({ tasks }: { tasks: ActiveTask[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [queue, setQueue] = useState<string[]>([]);
  const [selected, setSelected] = useState<ActiveTask | null>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem('activeTaskQueue'); if (raw) setQueue(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem('activeTaskQueue', JSON.stringify(queue)); } catch {} }, [queue]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'available': return tasks.filter(t => !t.submitted);
      case 'queue': return tasks.filter(t => queue.includes(t.id));
      case 'review': return tasks.filter(t => t.submitted && t.submissionStatus === 'submitted');
      case 'completed': return tasks.filter(t => t.submitted && (t.submissionStatus === 'approved' || t.submissionStatus === 'rejected'));
      case 'approved': return tasks.filter(t => t.submissionStatus === 'approved');
      case 'rejected': return tasks.filter(t => t.submissionStatus === 'rejected');
      default: return tasks;
    }
  }, [filter, tasks, queue]);

  return (
    <div className='min-h-screen font-sans bg-background text-foreground'>
      <header className='bg-background/80 backdrop-blur border-b h-14 px-4 flex items-center justify-between sticky top-0 z-40'>
        <div className='flex items-center gap-2'>
          <span className='relative flex h-2 w-2'><span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60'></span><span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500'></span></span>
          <span className='text-xs font-medium text-emerald-500'>Active Tasks</span>
        </div>
        <Link href='/dashboard'><Button variant='outline' size='sm'>Back</Button></Link>
      </header>
      <div className='sticky top-14 bg-background/80 backdrop-blur z-30 h-12 flex items-center border-b'>
        <div className='px-4 w-full overflow-x-auto'>
          <div className='flex items-center gap-2'>
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'available', label: 'Available' },
              { key: 'review', label: 'Under Review' },
              { key: 'completed', label: 'Completed' },
              { key: 'queue', label: 'Queue' }
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)} className={`h-8 px-3 rounded-md font-semibold text-xs transition-all ${filter===key?'bg-primary text-primary-foreground':'bg-muted text-foreground/70 hover:bg-muted/70'}`}>{label}</button>
            ))}
            <button disabled className='h-8 px-3 rounded-md font-semibold text-xs bg-muted text-foreground/40 flex items-center gap-1'><Flame size={14}/>Trending</button>
            <button disabled className='h-8 px-3 rounded-md font-semibold text-xs bg-muted text-foreground/40 flex items-center gap-1'><Star size={14}/>High XP</button>
          </div>
        </div>
      </div>
      <main className='pt-4 pb-10 px-4 max-w-3xl mx-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold'>Tasks</h2>
          {filter === 'completed' && (
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={() => setFilter('approved')}>Approved</Button>
              <Button variant='outline' size='sm' onClick={() => setFilter('rejected')}>Rejected</Button>
            </div>
          )}
        </div>
        <div className='space-y-4'>
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onDetailsClick={() => setSelected(task)} isPinned={queue.includes(task.id)} onPinToggle={() => setQueue(q => q.includes(task.id) ? q.filter(i=>i!==task.id) : [...q, task.id])} />
          ))}
          {filtered.length === 0 && <p className='text-xs text-muted-foreground'>No tasks match this filter.</p>}
        </div>
      </main>
      <Dialog open={!!selected} onOpenChange={(o)=>{ if(!o) setSelected(null) }}>
        <DialogContent className='max-w-xl'>
          {selected && (
            <div className='space-y-4'>
              <DialogHeader>
                <DialogTitle className='text-base font-semibold'>{selected.title}</DialogTitle>
                <DialogDescription className='text-xs'>Task details & instructions</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 text-sm'>
                <div>
                  <p className='font-medium mb-1'>Description</p>
                  <p className='text-xs leading-relaxed'>{selected.description}</p>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <Card className='py-3 px-4 gap-1'>
                    <span className='text-[10px] uppercase tracking-wide text-muted-foreground'>XP</span>
                    <span className='font-semibold text-sm'>{selected.xp}</span>
                  </Card>
                  <Card className='py-3 px-4 gap-1'>
                    <span className='text-[10px] uppercase tracking-wide text-muted-foreground'>Verification</span>
                    <span className='font-semibold text-sm'>{selected.verificationMode}</span>
                  </Card>
                </div>
              </div>
              <div className='flex justify-end gap-2 pt-2'>
                <Button variant='outline' size='sm' onClick={()=> selected && setQueue(q => q.includes(selected.id) ? q.filter(i=>i!==selected.id) : [...q, selected.id])}>
                  {selected && queue.includes(selected.id) ? 'Remove from Queue' : 'Add to Queue'}
                </Button>
                <Button size='sm' onClick={() => selected && router.push(`/tasks/daily/${selected.id}`)}>
                  Start Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
