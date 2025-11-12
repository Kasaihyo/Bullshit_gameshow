import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    // Load questions from JSON
    const questionsPath = path.join(__dirname, '../src/data/questions.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

    console.log(`📚 Seeding ${questionsData.questions.length} questions...`);

    for (const q of questionsData.questions) {
      await prisma.question.create({
        data: {
          category: q.category,
          difficulty: q.difficulty,
          question: q.question,
          options: JSON.stringify(q.options),
          correct: q.correct,
          explanation: q.explanation
        }
      });
    }

    console.log('✅ Questions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
