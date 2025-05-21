<template>
  <div class="paper-card">
    <h3 class="paper-title">{{ paperData.title }}</h3>
    <p class="paper-authors">{{ paperData.authors.join(', ') }} - {{ paperData.year }}</p>
    <div class="paper-tags">
      <span
        v-for="tag in paperData.tags.research_content"
        :key="tag"
        class="tag tag-content"
      >{{ tag }}</span>
      <span
        v-for="tag in paperData.tags.research_method"
        :key="tag"
        class="tag tag-method"
      >{{ tag }}</span>
      <span
        v-for="tag in paperData.tags.platform"
        :key="tag"
        class="tag tag-platform"
      >{{ tag }}</span>
    </div>
    <p class="paper-abstract">{{ truncateAbstract(paperData.abstract, 200) }}</p>
    <div class="card-footer">
        <a :href="paperData.pdf_url" target="_blank" class="paper-link">查看原文</a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  paperData: {
    type: Object,
    required: true,
  },
});

const truncateAbstract = (text, length) => {
  if (!text) return '';
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
};
</script>

<style scoped>
.paper-card {
  width: var(--paper-card-width);
  height: var(--paper-card-height); /* Fixed height */
  background-color: var(--color-background-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-sm);
  padding: var(--space-md);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column; /* Ensure content stacks and footer is at bottom */
  overflow: hidden; /* Prevent content from spilling out of fixed height card */
}

.paper-title {
  font-size: var(--font-size-card-title);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
  /* Allow title to wrap if long */
  max-height: calc(1.3em * 3); /* Approx 3 lines */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.paper-authors {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  flex-shrink: 0;
}

.paper-tags {
  margin-bottom: var(--space-sm);
  flex-shrink: 0;
  /* Allow tags to wrap */
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  max-height: calc( (var(--font-size-xs) + var(--space-xs) * 2 + 2px ) * 2 + var(--space-xs) ); /* Approx 2 lines of tags */
  overflow-y: auto; /* Scroll if too many tags, better than clipping */
}

.tag {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  border-radius: var(--border-radius-sm); /* less round */
  background-color: var(--color-placeholder-bg); /* Use a general tag bg */
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* Example specific tag colors using variables.css definitions */
.tag-content { background-color: var(--color-tag-content, #DBEAFE); color: var(--color-tag-content-text, #2563EB); }
.tag-method { background-color: var(--color-tag-method, #D1FAE5); color: var(--color-tag-method-text, #059669); }
.tag-platform { background-color: var(--color-tag-platform, #FEF3C7); color: var(--color-tag-platform-text, #D97706); }


.paper-abstract {
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  flex-grow: 1; /* Abstract takes available space */
  overflow-y: auto; /* Scroll abstract if it's too long for the card */
}

.card-footer {
  margin-top: auto; /* Pushes footer to the bottom */
  padding-top: var(--space-sm); /* Space above the link */
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;
  text-align: right;
}

.paper-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.paper-link:hover {
  text-decoration: underline;
}
</style>