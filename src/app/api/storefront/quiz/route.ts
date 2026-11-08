import { NextResponse } from "next/server";
import { adminRepository } from "@/lib/admin-repository";
export const dynamic = "force-dynamic";
export async function GET() { const settings = adminRepository.getSettings(); return NextResponse.json({ published: settings.quizPublished !== false, questions: adminRepository.list("quizQuestions").sort((a, b) => a.position - b.position), outcomes: adminRepository.list("quizOutcomes") }); }
