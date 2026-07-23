export interface Template {
  name: string;
  description: string;
  markdown: string;
}

export const TEMPLATES: Template[] = [
  {
    name: 'Daily Log',
    description: 'Track done, todo, and notes',
    markdown: `# Daily Log

## Done
- [ ]

## Todo
- [ ]
- [ ]

## Notes

`,
  },
  {
    name: 'Todo List',
    description: 'Simple prioritised task list',
    markdown: `# Todo List

## Today
- [ ]
- [ ]

## This Week
- [ ]
- [ ]

## Someday
- [ ]
`,
  },
  {
    name: 'Meeting Notes',
    description: 'Agenda, notes, and action items',
    markdown: `# Meeting Notes

**Date:**
**Attendees:**

## Agenda
1.
2.

## Notes

## Action Items
- [ ]
- [ ]
`,
  },
  {
    name: 'Weekly Review',
    description: 'Wins, challenges, next week goals',
    markdown: `# Weekly Review

## Wins
-
-

## Challenges
-
-

## Goals for Next Week
- [ ]
- [ ]
`,
  },
];
