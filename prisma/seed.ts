import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Admin user (NextAuth Credentials) ──
  const email = process.env.ADMIN_EMAIL ?? 'adminroshan@gmail.com';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: 'Roshan', role: 'admin' },
  });
  console.log(`✔ admin user: ${email}`);

  // ── Profile (singleton) ──
  await prisma.profile.upsert({
    where: { id: 'profile' },
    update: {},
    create: {
      id: 'profile',
      name: 'Roshan Chawal',
      title: 'Software Engineer',
      bio: 'Passionate about creating elegant solutions to complex problems. With over 2 years of experience in full-stack development, I specialize in building scalable web applications that balance performance with user experience.',
      bioSecondary:
        'I am constantly learning and adapting to new technologies to deliver the best possible results for every project.',
      resumeUrl: '/images/ROSHAN-CHAWAL-SD-Resume.pdf',
      email: 'roshan@gmail.com',
      socialLinks: [
        { label: 'GitHub', url: 'https://github.com', icon: 'github' },
        { label: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
        { label: 'Email', url: 'mailto:roshan@gmail.com', icon: 'mail' },
      ],
    },
  });
  console.log('✔ profile');

  // ── Skills (mirrors the original hardcoded skillCategories in Hero.jsx) ──
  const skills: {
    name: string; category: string; icon: string; level: string; url: string;
  }[] = [
    // Frontend
    { name: 'React', category: 'Frontend', icon: 'react', level: 'Intermediate', url: 'https://react.dev/' },
    { name: 'Next.js', category: 'Frontend', icon: 'nextjs', level: 'Intermediate', url: 'https://nextjs.org/' },
    { name: 'JavaScript', category: 'Frontend', icon: 'javascript', level: 'Intermediate', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { name: 'HTML5', category: 'Frontend', icon: 'html5', level: 'Advanced', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
    { name: 'CSS3', category: 'Frontend', icon: 'css3', level: 'Advanced', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
    { name: 'Tailwind CSS', category: 'Frontend', icon: 'tailwind', level: 'Intermediate', url: 'https://tailwindcss.com/' },
    { name: 'Material UI', category: 'Frontend', icon: 'materialui', level: 'Intermediate', url: 'https://mui.com/' },
    // Backend
    { name: 'Node.js', category: 'Backend', icon: 'nodejs', level: 'Intermediate', url: 'https://nodejs.org/' },
    { name: 'NestJS', category: 'Backend', icon: 'nestjs', level: 'Intermediate', url: 'https://nestjs.com/' },
    { name: 'PHP', category: 'Backend', icon: 'php', level: 'Intermediate', url: 'https://www.php.net/' },
    { name: 'Python', category: 'Backend', icon: 'python', level: 'Intermediate', url: 'https://www.python.org/' },
    { name: 'GitHub', category: 'Backend', icon: 'github', level: 'Intermediate', url: 'https://github.com/' },
    // Database
    { name: 'PostgreSQL', category: 'Database', icon: 'postgresql', level: 'Intermediate', url: 'https://www.postgresql.org/' },
    { name: 'MySQL', category: 'Database', icon: 'mysql', level: 'Intermediate', url: 'https://www.mysql.com/' },
    { name: 'MongoDB', category: 'Database', icon: 'mongodb', level: 'Intermediate', url: 'https://www.mongodb.com/' },
    { name: 'Prisma', category: 'Database', icon: 'prisma', level: 'Intermediate', url: 'https://www.prisma.io/' },
    // DevOps
    { name: 'Docker', category: 'DevOps', icon: 'docker', level: 'Intermediate', url: 'https://www.docker.com/' },
  ];

  // Idempotent: clear + re-create so re-seeding stays in sync with this list.
  await prisma.skill.deleteMany({});
  await prisma.skill.createMany({
    data: skills.map((s, i) => ({ ...s, order: i })),
  });
  console.log(`✔ ${skills.length} skills`);

  // ── Sample projects (the public site previously had no projects) ──
  await prisma.project.upsert({
    where: { slug: 'portfolio-website' },
    update: {},
    create: {
      title: 'Portfolio Website',
      slug: 'portfolio-website',
      description:
        'A dynamic, database-driven portfolio built with Next.js App Router, Prisma, and Vercel Postgres. Server-rendered content with an authenticated admin panel.',
      techStack: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS'],
      imageUrl: null,
      liveUrl: 'https://example.com',
      repoUrl: 'https://github.com',
      order: 0,
      published: true,
    },
  });
  await prisma.project.upsert({
    where: { slug: 'task-manager-api' },
    update: {},
    create: {
      title: 'Task Manager API',
      slug: 'task-manager-api',
      description:
        'A REST API for task management with JWT auth, role-based access, and PostgreSQL persistence.',
      techStack: ['NestJS', 'PostgreSQL', 'Docker'],
      order: 1,
      published: true,
    },
  });
  console.log('✔ sample projects');

  // ── Sample blog post ──
  await prisma.blog.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: 'Hello World',
      slug: 'hello-world',
      excerpt: 'The first post on my new Next.js-powered blog.',
      content:
        '<h2>Welcome</h2><p>This blog is authored with a Tiptap rich-text editor in the admin panel and rendered server-side with SSG/ISR.</p><p>Publishing a post triggers on-demand revalidation, so it appears instantly.</p>',
      tags: ['nextjs', 'meta'],
      published: true,
      publishedAt: new Date(),
    },
  });
  console.log('✔ sample blog post');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
