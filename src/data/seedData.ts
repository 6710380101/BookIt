import { Room, DemoAccount } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'ห้องปฏิบัติการคอมพิวเตอร์ 1',
    type: 'computer',
    typeName: 'ห้องคอมพิวเตอร์',
    capacity: 40,
    building: 'อาคาร 2 ชั้น 3',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOQw-1HjKgngloBY0HAyZFrWK9duyLLWvwiHGbmJhsiHW9Alf54Ebenoe14JwWhLSG7VBZGiw05OrVrJPYrCJUsQFIa8jXrbOGjRv46SsWlGGn07Vmv6c19ALm9xHDcy-zLyn1JqfNrZzIrE3lwcml9Sc38Rg-yVZ_7ypCSNc--Ers-MBIXl8MfxgqcvBY2YGxLZiz1t4qv66y3jpKhNsklXHg86J9N0rljv8Uc6g8b9DZR0AZGrb-cg',
    isActive: true,
    equipment: ['คอมพิวเตอร์ 42 เครื่อง', 'โปรเจกเตอร์ 4K', 'Wi-Fi 6 ความเร็วสูง']
  },
  {
    id: 'room-2',
    name: 'ห้องประชุมสิรินธร',
    type: 'meeting',
    typeName: 'ห้องประชุม',
    capacity: 25,
    building: 'อาคารอำนวยการ ชั้น 2',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1Q_t9J1jB_stnYuL_Jma-gDeiu5IW739deK13EqwoPMTAqhoMWoTmYbULQRiAIPZmyNgcboXjfZ6v35rRYHGqFlUngew43GKuttkALZfmtVy6a5T1pnrxcIWTCjf2rqdAAYvdVwEDTQlMDdFs40KPr0RZL9cx73DGdnxLlyuWp7XuDGqfH_Dbx2Kny2cYqJBTnyPAU_ttPlTaGRTduoPIrNlWLyFWt6FD28Lt3punbHHJX5crZuxxxw',
    isActive: true,
    equipment: ['ระบบวิดีโอคอนเฟอเรนซ์', 'จอ Interactive Board', 'ไมโครโฟนตั้งโต๊ะ']
  },
  {
    id: 'room-3',
    name: 'หอประชุมใหญ่เฉลิมพระเกียรติ',
    type: 'hall',
    typeName: 'หอประชุม',
    capacity: 350,
    building: 'อาคารกิจกรรมกลาง ชั้น 1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSuo9Z34Ki9z58W_xu7Qit4ZKwPTjA7Kk-OfRm3_HAswGYzSIKz3-cS0Tu5nqTyy5X6JCltdYObuiU8ORnr4RuP4KE8hp4rPTfiIbIwb__fBTk7mkhDKBFvF6rYYWhcNzCa-PxA1yq_G_Gdpg_Y5xpXtae55MFRhhuInsb7CsbsqRfxBjnfQambUJDEE8qn8IjdRw2WbITLFyDREbylvA4PrnpOvdeeMrgTbysayZ30_ThsQXuT9BjAA',
    isActive: true,
    equipment: ['ระบบเครื่องเสียงมืออาชีพ', 'ไฟเวทีควบคุม DMX', 'จอ LED ขนาดใหญ่']
  },
  {
    id: 'room-4',
    name: 'ห้องคอมพิวเตอร์กราฟิก 2',
    type: 'computer',
    typeName: 'ห้องคอมพิวเตอร์',
    capacity: 35,
    building: 'อาคาร 2 ชั้น 4',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACY_id-eKzCOxm3t-D780VkFRWzhe96cZc7jl_3Z7mc-p9JIPSgfV-1rlR-hUNkx-DTD1UXvSQMAdRneokMnxRYfi5BlY9b2QGAbdAw2aHTZJ2PlOoiSqe4AUkPO_Bac8f83VMyZw6VBuFnypZ_PEroRVPP3xb1oA-orDWpfEvL9TwXn8LifbgFZw9DTXsTYcBoHZriWFm78EmSugP4u28fJiiYEqLPbWDzo5Zest8n_0GAdG_MjrmJw',
    isActive: false, // ปิดปรับปรุงชั่วคราว
    equipment: ['เครื่อง Workstation 35 ชุด', 'เมาส์ปากกา Wacom', 'จอ Color-Calibrated']
  },
  {
    id: 'room-5',
    name: 'ห้องปฏิบัติการวิทยาศาสตร์ SC-2',
    type: 'science',
    typeName: 'ห้องปฏิบัติการวิทย์',
    capacity: 40,
    building: 'อาคารวิทยาศาสตร์ ชั้น 2',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6iWRIqS-76pHBeABa94RRcFZ3AllxMzlkndGbri641It1amMo5e2z93OIHsw-aNKZ1S49AUQaGiOxXroYcsVBkpUfTckPCBejxTKUJ1f6-ZXAHSTFmurz9P0ddQzF2dz1EbCUYA4pLmBLfx9lwMNf9blPOy0rx3hGV_dVkdFGuqeypIdBNKDF-q1RJFqp6YJKUFGjxQ9Uz-pKljR7fgQGGxol_sO1WEvMoTiM1ehgKQrltOE3SvAiVg',
    isActive: true,
    equipment: ['กล้องจุลทรรศน์ 20 ชุด', 'โปรเจกเตอร์อินเทอร์แอคทีฟ', 'ตู้ดูดควันสารเคมี']
  },
  {
    id: 'room-6',
    name: 'Smart Classroom 401',
    type: 'smart',
    typeName: 'ห้อง Smart Classroom',
    capacity: 45,
    building: 'อาคาร 4 ชั้น 4',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmhm_UyYhSaKOwgdkoocNAdZE2cJa6RYZ1V4HIMbtz4WDdSG7gtznmXMVs66KvG--z2vOJCtcDLNVUzUKnBDkCtlNo0MzUPTBKJrtBdz48dpsLs_GvaQKa17bqT6VG1eiwzfZT9OTgRLvBZk8cZzaErlQ5siF93e33czUouB4N3O_5DxMgQPZvOtUEKKq6f_n1fxsybtex89V3SsSyENXa2EjFp7C5iLXEd4bae_NJwL1nScmLiKrkIw',
    isActive: true,
    equipment: ['จอ Touchscreen 86 นิ้ว x2', 'กล้อง AI Auto-Tracking', 'โต๊ะเรียนปรับรูปแบบได้']
  }
];

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-admin-1',
    email: 'areeya.s@school.ac.th',
    name: 'อ. อารีญา ศรีวิลัย',
    role: 'admin',
    department: 'กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี',
    phone: '02-xxx-xxxx ต่อ 304',
    password: 'admin1234',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnMv3-AdbVXt0pCgsNiCoGy9SgkMWoZJy6z2R7MecgnngLzO5t9ZSQ_xOlkieXyJjO82umRfxOml2TLxwT2oTFZ9yV6QJcHtSfJtUjcNRmmckqTcQ6hUbTkXZC0XJ5aHEIZFw7sEv1bHrktOdNCEunIz8hp7-vRhoDJPQWL9me5zJp0014HYeOce0dFdEzySYo4LQtH7HHWvGfvY_GDqYUwPb9H_QLP_uqbHaU_rZqPWEHFsyaHCoMoQ'
  },
  {
    id: 'demo-teacher-1',
    email: 'chaiyaporn.n@school.ac.th',
    name: 'อ. ชัยพร นพเก้า',
    role: 'teacher',
    department: 'กลุ่มสาระศิลปะและการแสดง',
    phone: '02-xxx-xxxx ต่อ 108',
    password: 'teacher1234'
  },
  {
    id: 'demo-teacher-2',
    email: 'peera.s@school.ac.th',
    name: 'อ. พีระ สมบูรณ์',
    role: 'teacher',
    department: 'หัวหน้ากลุ่มสาระคณิตศาสตร์',
    phone: '02-xxx-xxxx ต่อ 205',
    password: 'teacher1234'
  },
  {
    id: 'demo-student-1',
    email: 'karn.p@student.school.ac.th',
    name: 'นายกานต์ พงษ์ศิริ',
    role: 'student',
    department: 'รหัสนักเรียน 49210 (ม.6/1 ประธานชมรม)',
    phone: '081-xxx-xxxx',
    password: 'student1234'
  },
  {
    id: 'demo-student-2',
    email: 'nicha.s@student.school.ac.th',
    name: 'น.ส. ณิชา สิทธิเดช',
    role: 'student',
    department: 'รหัสนักเรียน 49215 (ม.5/2)',
    phone: '089-xxx-xxxx',
    password: 'student1234'
  }
];
