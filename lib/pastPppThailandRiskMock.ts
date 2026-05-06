import { ALL_SECTORS } from '@/lib/dashboardMockData'

export type PastPppRiskProjectRow = {
  projectId: string
  projectName: string
  problem: string
  riskImpact: string
  riskResponse: string
  phase: string
  riskGroup: string
  riskFactor: string
  riskGroups?: string[]
  riskFactors?: string[]
  riskBreakdown?: Array<{
    riskGroup: string
    riskFactors: string[]
  }>
}

export type PastPppRiskIncident = {
  id: string
  summaryProblem: string
  riskGroup: string
  riskFactor: string
  phase: string
  projects: PastPppRiskProjectRow[]
  riskBreakdown?: Array<{
    riskGroup: string
    riskFactors: string[]
  }>
}

export type PastPppSectorPastRisks = {
  sectorKey: string
  incidents: PastPppRiskIncident[]
}

const INCIDENTS_BY_SECTOR: Record<string, PastPppRiskIncident[]> = {
  'transport.road': [
    {
      id: 'tr-1',
      summaryProblem: 'ค่าโง่ประมาณการจราจรต่ำกว่าความเป็นจริง ส่งผลต่อความคุ้มค่าทางการเงิน',
      riskGroup: 'ความเสี่ยงด้านการเงินและรายได้',
      riskFactor: 'ความต้องการใช้บริการ / ปริมาณจราจร',
      phase: 'operation',
      projects: [
        {
          projectId: 'p-tr-1',
          projectName: 'ทางพิเศษสายตัวอย่าง (จำลอง)',
          problem: 'ปริมาณจราจรเฉลี่ยต่ำกว่าที่คาดใน 3 ปีแรกหลังเปิดใช้',
          riskImpact: 'รายได้ค่าผ่านทางต่ำกว่าเป้า กระทบ DSCR',
          riskResponse: 'ปรับแผนการตลาดและโครงสร้างค่าธรรมเนียมร่วมกับหน่วยงานรัฐ',
          phase: 'operation',
          riskGroup: 'ความเสี่ยงด้านการเงินและรายได้',
          riskFactor: 'ความต้องการใช้บริการ / ปริมาณจราจร',
        },
        {
          projectId: 'p-tr-2',
          projectName: 'โครงการทางหลวงพิเศษแห่งที่สอง (จำลอง)',
          problem: 'แนวโน้มจราจรเปลี่ยนหลังมีเส้นทางสาธารณะทางเลือก',
          riskImpact: 'แบ่งส่วนแบ่งการใช้ทาง ลดรายได้คาดการณ์',
          riskResponse: 'ทบทวนแบบจำลองจราจรและเงื่อนไขสัมปทาน',
          phase: 'operation',
          riskGroup: 'ความเสี่ยงด้านการเงินและรายได้',
          riskFactor: 'การแข่งขันจากโครงข่ายอื่น',
        },
      ],
    },
    {
      id: 'tr-2',
      summaryProblem: 'ความล่าช้าในการส่งมอบที่ดินและการอนุญาตก่อสร้าง',
      riskGroup: 'ความเสี่ยงด้านกฎหมายและสัญญา',
      riskFactor: 'การถือครองที่ดินและการอนุญาต',
      phase: 'construction',
      projects: [
        {
          projectId: 'p-tr-3',
          projectName: 'ทางด่วนวงแหวน (จำลอง)',
          problem: 'การเวนคืนที่ดินบางแปลงล่าช้าเกินแผน 6 เดือน',
          riskImpact: 'เลื่อนกำหนด COD ส่งผลต่อค่าใช้จ่ายก่อสร้างและดอกเบี้ยระหว่างก่อสร้าง',
          riskResponse: 'ใช้สิทธิ์ขยายเวลาตามสัญญาและเจรจาชดเชยกับรัฐ',
          phase: 'construction',
          riskGroup: 'ความเสี่ยงด้านกฎหมายและสัญญา',
          riskFactor: 'การถือครองที่ดินและการอนุญาต',
        },
      ],
    },
  ],
  'transport.rail': [
    {
      id: 'rail-1',
      summaryProblem: 'ต้นทุนงานโยงายใต้ดินสูงกว่าประมาณการจากสภาพหินและท่อสาธารณูปโภค',
      riskGroup: 'ความเสี่ยงด้านการก่อสร้าง',
      riskFactor: 'สภาพแวดล้อมการก่อสร้าง / ภูมิประเทศ',
      phase: 'construction',
      projects: [
        {
          projectId: 'p-rail-1',
          projectName: 'รถไฟฟ้าสายสีตัวอย่าง (จำลอง)',
          problem: 'พบท่อระบายน้ำเก่าไม่ตรงแบบสำรวจ ต้องออกแบบใหม่ช่วง 800 ม.',
          riskImpact: 'งบก่อสร้างเพิ่มและเลื่อนกำหนดเปิดทดลอง',
          riskResponse: 'แบ่ง risk ตามสัญญา (owner risk) และปรับแผนจัดหาเงินทุนเสริม',
          phase: 'construction',
          riskGroup: 'ความเสี่ยงด้านการก่อสร้าง',
          riskFactor: 'สภาพแวดล้อมการก่อสร้าง / ภูมิประเทศ',
        },
      ],
    },
  ],
  energy: [
    {
      id: 'en-1',
      summaryProblem: 'ราคาเชื้อเพลิงผันผวนกระทบต้นทุนผลิตไฟฟ้า',
      riskGroup: 'ความเสี่ยงด้านตลาดและราคา',
      riskFactor: 'ราคาเชื้อเพลิง / อัตแลกเปลี่ยน',
      phase: 'operation',
      projects: [
        {
          projectId: 'p-en-1',
          projectName: 'โรงไฟฟ้าพลังงานหมุนเวียน (จำลอง)',
          problem: 'ราคาก๊าซพุ่งช่วง 18 เดือนแรกหลัง COD',
          riskImpact: 'ต้นทุนต่อหน่วยสูงขึ้น กดมาร์จิ้น',
          riskResponse: 'ใช้สูตรค่าเชื้อเพลิงผู้อ้างอิงในสัญญาและ hedge บางส่วน',
          phase: 'operation',
          riskGroup: 'ความเสี่ยงด้านตลาดและราคา',
          riskFactor: 'ราคาเชื้อเพลิง / อัตแลกเปลี่ยน',
        },
      ],
    },
  ],
  health: [
    {
      id: 'hl-1',
      summaryProblem: 'อุปสงค์บริการทางการแพทย์แตกต่างจากที่คาดในการศึกษาความเป็นไปได้',
      riskGroup: 'ความเสี่ยงด้านการดำเนินงาน',
      riskFactor: 'อุปสงค์บริการ / การใช้ความจุ',
      phase: 'operation',
      projects: [
        {
          projectId: 'p-hl-1',
          projectName: 'โรงพยาบาลเอกชนร่วมรัฐ (จำลอง)',
          problem: 'จำนวนผู้ป่วยนอกโรคเฉพาะทางต่ำกว่าเป้า',
          riskImpact: 'รายได้ค่าบริการต่ำกว่าแผนธุรกิจ',
          riskResponse: 'ขยายสัญญาณเชิญรพ.ส่งต่อและปรับแพ็กเกจบริการ',
          phase: 'operation',
          riskGroup: 'ความเสี่ยงด้านการดำเนินงาน',
          riskFactor: 'อุปสงค์บริการ / การใช้ความจุ',
        },
        {
          projectId: 'p-hl-2',
          projectName: 'ศูนย์บริการสุขภาพภูมิภาค (จำลอง)',
          problem: 'การส่งต่อผู้ป่วยจาก รพ. รัฐต่ำกว่าที่ประมาณการ',
          riskImpact: 'อัตราใช้เตียงเฉลี่ยต่ำกว่าเป้า',
          riskResponse: 'เจรจา MOU กับหน่วยงานสาธารณสุขในจังหวัด',
          phase: 'operation',
          riskGroup: 'ความเสี่ยงด้านการดำเนินงาน',
          riskFactor: 'อุปสงค์บริการ / การใช้ความจุ',
        },
      ],
    },
  ],
}

export function getMockPastPppThailandRisksBySector(): PastPppSectorPastRisks[] {
  return ALL_SECTORS.map((sectorKey) => ({
    sectorKey,
    incidents: INCIDENTS_BY_SECTOR[sectorKey] ?? [],
  }))
}

export function countTotalProjects(incidents: PastPppRiskIncident[]): number {
  const ids = new Set<string>()
  for (const inc of incidents) {
    for (const p of inc.projects) {
      ids.add(p.projectId)
    }
  }
  return ids.size
}
