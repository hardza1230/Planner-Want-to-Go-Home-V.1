import { Workflow, Shortcut, Tool } from './types';

export const AVAILABLE_ICONS = [
  'fa-link', 'fa-shield-halved', 'fa-chart-line', 'fa-file-alt', 
  'fa-cogs', 'fa-database', 'fa-server', 'fa-cloud', 
  'fa-envelope', 'fa-folder-open', 'fa-globe', 'fa-print', 
  'fa-calculator', 'fa-camera', 'fa-video', 'fa-music',
  'fa-scissors', 'fa-terminal', 'fa-code', 'fa-bug', 'fa-robot', 'fa-clock', 'fa-keyboard'
];

export const DEFAULT_TOOLS: Tool[] = [
  { id: 1, name: 'Calculator', link: 'calc.exe', icon: 'fa-calculator' },
  { id: 2, name: 'Snipping Tool', link: 'snippingtool.exe', icon: 'fa-scissors' },
  { id: 3, name: 'Command Prompt', link: 'cmd.exe', icon: 'fa-terminal' },
];

export const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: 1,
    title: "เตรียมโปรแกรมก่อนทำงาน",
    tasks: [
      {
        name: "Login Citrix เพื่อดึง Order Status",
        type: "link",
        link: "microsoft-edge:http://172.16.10.80/Citrix/XenApp/auth/login.aspx"
      },
      {
        name: "รอ Login Citrix",
        type: "delay",
        value: "5000"
      },
      {
        name: "เปิด Power Bi",
        type: "link",
        link: "D:\\Project\\0.Power Bi\\Planning\\Digital Management_PLP Version 2025 Rev.0.2.pbix"
      },
      {
        name: "กด Refresh Data (Simulation)",
        type: "keys",
        value: "Ctrl+R"
      },
      {
        name: "เปิด BIS",
        type: "link",
        link: "C:\\BIS\\BIS.exe",
        windowConfig: { x: 0, y: 0, width: 800, height: 600 }
      },
      {
        name: "เปิด Excel อัพเดท SamFG",
        type: "link",
        link: "C:\\Users\\norrasates\\Desktop\\CPPC-Planning\\Workbooklink\\ผลผลิต.xlsx",
        windowConfig: { x: 800, y: 0, width: 800, height: 600 }
      },
      {
        name: "เว็บ Planning",
        type: "link",
        link: "http://172.16.55.95/planning/login.aspx"
      }
    ]
  },
  {
    id: 6,
    title: "อัพเดทแก้ไขข้อมูล",
    tasks: [
      {
        name: "ตัดผลผลิต",
        type: "link",
        link: "#"
      },
      {
        name: "ไฟล์ Order Status",
        type: "link",
        link: "\\\\172.16.51.25\\fsTaskMan\\Report\\OutputFiles\\NorrasateS"
      },
      {
        name: "Update Data Print",
        type: "link",
        link: "C:\\Users\\norrasates\\Desktop\\CPPC-Planning\\Workbooklink\\Data Print.xlsx"
      },
      {
        name: "รอ Excel เปิด",
        type: "delay",
        value: "3000"
      },
      {
        name: "Refresh Power BI",
        type: "keys",
        value: "F5"
      }
    ]
  },
  {
    id: 4,
    title: "ออเดอร์ใหม่ และ เปิด Job",
    tasks: [
      {
        name: "เพิ่มออเดอร์ใหม่",
        type: "link",
        link: "C:\\Users\\norrasates\\Desktop\\CPPC-Planning\\Workbooklink\\Daily Order.csv"
      },
      {
        name: "แก่ไขข้อมูลเคลือบใน แผนพิมพ์",
        type: "link",
        link: "\\\\172.16.51.11\\Planning\\17.แผนผลิต ฝ่ายผลิต 2-3\\แผนเคลือบ\\2025\\ต.ค 68"
      },
      {
        name: "ฝากแผน CI",
        type: "link",
        link: "\\\\172.16.51.11\\Planning\\25.แผนผลิตเครื่องตัดสวมถุงใน 2.1_2.3\\2025\\ต.ค 2025"
      }
    ]
  },
  {
    id: 7,
    title: "Update แผนพิมพ์",
    tasks: [
      {
        name: "Upload แผนพิมพ์",
        type: "link",
        link: "https://cppl-jp.cppc.co.th/Planning/Plan/Upload"
      },
      {
        name: "Calculation แผนพิมพ์",
        type: "link",
        link: "https://cppl-jp.cppc.co.th/Planning/Calculation/Index"
      },
      {
        name: "ส่งแผนใน Connect",
        type: "link",
        link: "https://cppc.ekoapp.com/recents/group/67121da6dcb881674b73fbfc/t/67121e99a3606b0d15fcaaad?ref=recent_search&threadSegment=558"
      }
    ]
  },
  {
    id: 9,
    title: "Update แผนตัด",
    tasks: [
      {
        name: "เซฟแผนพิมพ์",
        type: "link",
        link: "\\\\172.16.51.11\\Planning\\19.แผนผลิต ฝ่ายผลิต 4\\แผนพิมพ์โรง 4\\2025\\10. ต.ค.25"
      },
      {
        name: "เซฟแผนขาย",
        type: "link",
        link: "\\\\172.16.51.11\\Planning\\21.รายการแจ้งขาย\\แจ้งขายโรง 4\\2025\\10. Oct"
      }
    ]
  },
  {
    id: 11,
    title: "แผนตัด",
    tasks: [
      {
        name: "เปิดแผนตัด",
        type: "link",
        link: "\\\\172.16.51.11\\Planning\\19.แผนผลิต ฝ่ายผลิต 4\\ตัดเย็บอัตโนมัติ โรง4\\2025\\10. แผนตัด ตุลาคม 25"
      }
    ]
  }
];

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: 1, name: 'Connect VPN', link: 'C:\\Program Files\\Fortinet\\FortiClient\\FortiClient.exe', icon: 'fa-shield-halved' },
  { id: 2, name: 'Power BI', link: 'https://powerbi.microsoft.com', icon: 'fa-chart-line' },
];