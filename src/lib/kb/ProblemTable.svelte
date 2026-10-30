<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, WHAT, type Problem } from '#lib/kb/problems';

  // tickets: problem → link to the ticket filed for it.
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{split.total}</strong> reports merged into #{ticket} ·
  <strong>{split.rows.length}</strong>
  {split.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.rows as row (row.problem)}
      <tr>
        <td><code>{row.problem}</code><br /><span class="what">{row.problem === 'unplaced' ? 'No tenant on file.' : WHAT[row.problem]}</span></td>
        <td>{row.reports}{row.filedUnder ? '*' : ''}</td>
        <td>{row.tenants}</td>
        <td>{row.firstSeen} → {row.lastSeen}</td>
        <td>
          {#if row.problem !== 'unplaced' && tickets[row.problem]}
            <a href={tickets[row.problem]}>{tickets[row.problem]?.replace(/^.*\/issues\//, 'GitHub #')}</a>
          {:else}
            none
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.rows as row (row.problem)}
  {#if row.filedUnder}
    <p class="note">* Counted where the desk files them, under <code>{row.filedUnder}</code>, as in the #{ticket} cause table.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
