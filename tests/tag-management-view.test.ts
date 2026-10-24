import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

test('popular features do not render the hardcoded quick search groups', () => {
  const source = readFileSync(
    join(projectRoot, 'components/home/PopularFeatures.tsx'),
    'utf8',
  );

  assert.doesNotMatch(source, /CategoryQuickSearch/);
});

test('popular tag management mode stays out of discovery grids', () => {
  const source = readFileSync(
    join(projectRoot, 'components/home/PopularFeatures.tsx'),
    'utf8',
  );

  assert.match(source, /const isTagManagementMode = showTagManager;/);
  assert.match(source, /!\s*isTagManagementMode && !effectiveRecommendSelected/);
  assert.match(source, /!\s*isTagManagementMode && \(/);
});

test('tag management list uses wrapping chip layout instead of a horizontal search filter row', () => {
  // 拖拽实现已拆到 SortableTagList.tsx 并改为懒加载（TagList.tsx 只剩普通标签行），断言随实现走
  const source = readFileSync(
    join(projectRoot, 'components/home/SortableTagList.tsx'),
    'utf8',
  );

  assert.match(source, /rectSortingStrategy/);
  assert.match(source, /showTagManager\s*\?\s*'flex-wrap overflow-visible'/);
  assert.match(source, /showTagManager \? rectSortingStrategy : horizontalListSortingStrategy/);
});
