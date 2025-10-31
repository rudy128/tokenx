"use client";

import type { NextPage } from 'next';
import { ChevronLeft, Twitter, Repeat, BookOpen, MessageSquare, Video, Mic, FileText, UserPlus, BarChart, Check, ArrowRight } from 'lucide-react';
import React, { FC, useState } from 'react';

//- ============================================================================
//- TYPE DEFINITIONS
//- ============================================================================
import { redirect } from 'next/navigation';

// Deprecated dashboard daily tasks route. Redirect to new location.
export default function Page() {
  redirect('/tasks/daily');
}