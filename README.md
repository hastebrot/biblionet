# biblionet

business domain

- file, file listing
- topics
- authors
- books
- texts
- concepts
- questions
- propositions
- changes, rankings
- excerpts, quotations

visual design, information architecture

- panel based navigation
- main navigation
- entities with filters, group and sort (newest, oldest, most cited), and views (list, table)
- timelines, graphs
- references
- lock text block after time

---

- slow and fast updates

---

tasks:

- [ ] load blocks and display them, i.e. block.id and block.text
- [ ] add and remove blocks
- [ ] transform block.text to block.tags[], update when block.text is changed
- [ ] associate schema to tag, e.g. for the start just a color
- [ ] display color of tag in block
- [ ] once we have a block schema, we can define optional and mandatory block fields
- [ ] display block fields, allow to add and remove block fields

---

- every block gets an invisible input field with key (frontend htmx)
- the content of the input field is added as `["blocks", block.id]` in kv-store

- if you add `#tag` it will also add the content as `["blocks-by-tag", tag.name, block.id]` in kv-store, also works for multiple tags, and also for removed tags
	- how to update when the tagname changes. maybe with tag position index in block?

- a block can have fields (visually they are either additional columns, or key value pairs in indented rows with border top and bottom, like tanainc)
- the additional fields need to be associated with the block `["fields", block.id, field.id]`
	- what do we associate? blocks with fields, fields with blocks, blocks with blocks?
	- we can also quickly lookup fields when we only have the field id but need the field content. normalization of schema and redundancy?
- (the kv-store allow bi-directional mappings using a secondary id for relational features)
- we also have to save supertag schemas

- blocks have a parent and children
