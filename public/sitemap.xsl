<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:i="http://www.google.com/schemas/sitemap-image/1.1" exclude-result-prefixes="s i">
  <xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>
  <xsl:key name="images" match="i:image/i:loc" use="."/>
  <xsl:template name="meta">
    <xsl:param name="data" select="comment()[1]"/>
    <xsl:param name="key"/>
    <xsl:value-of select="substring-before(substring-after($data,concat($key,':')),';')"/>
  </xsl:template>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>XML Sitemap | POA DUBAI</title>
        <link rel="stylesheet" type="text/css" href="/sitemap-style.css"/>
      </head>
      <body><main>
        <header><a class="brand" href="/en">POA DUBAI</a><nav aria-label="Sitemap navigation"><a href="/sitemap.xml">Sitemap index</a></nav></header>
        <div class="eyebrow">XML Sitemap</div>
        <xsl:choose>
          <xsl:when test="s:sitemapindex"><xsl:apply-templates select="s:sitemapindex"/></xsl:when>
          <xsl:otherwise><xsl:apply-templates select="s:urlset"/></xsl:otherwise>
        </xsl:choose>
        <div class="note"><p>Published comes from the article publication date. Last modified is the latest known content update, which may be later. Unknown dates are omitted. Time zone: UTC.</p></div>
        <p class="foot">POA DUBAI · Browser presentation of the XML sitemap. The underlying sitemap data remains available to search engines.</p>
      </main></body>
    </html>
  </xsl:template>
  <xsl:template match="s:sitemapindex">
    <h1>Website sitemap</h1>
    <p class="muted">Choose a language to open its XML sitemap.</p>
    <section class="stats" aria-label="Sitemap statistics">
      <div class="stat"><strong><xsl:call-template name="meta"><xsl:with-param name="key" select="'URLs'"/></xsl:call-template></strong><span>Page URLs</span></div>
      <div class="stat"><strong><xsl:value-of select="count(s:sitemap)"/></strong><span>Languages</span></div>
      <div class="stat"><strong><xsl:call-template name="meta"><xsl:with-param name="key" select="'Images'"/></xsl:call-template></strong><span>Image entries</span></div>
      <div class="stat"><strong><xsl:call-template name="meta"><xsl:with-param name="key" select="'Unique'"/></xsl:call-template></strong><span>Unique images</span></div>
    </section>
    <section class="panel"><h2 class="panel-title">Language sitemaps</h2><div class="table-scroll"><table class="overview" aria-label="Language sitemaps"><thead><tr><th scope="col">Language</th><th scope="col">URLs</th><th scope="col">Images</th><th scope="col">Last modified</th></tr></thead><tbody>
      <xsl:for-each select="s:sitemap"><tr>
        <td><a class="language" href="{s:loc}"><bdi><xsl:call-template name="meta"><xsl:with-param name="key" select="'Name'"/></xsl:call-template></bdi><span class="tag"><xsl:call-template name="meta"><xsl:with-param name="key" select="'Code'"/></xsl:call-template></span></a><span class="sitemap-address"><xsl:value-of select="s:loc"/></span></td>
        <td><xsl:call-template name="meta"><xsl:with-param name="key" select="'URLs'"/></xsl:call-template></td>
        <td><xsl:call-template name="meta"><xsl:with-param name="key" select="'Images'"/></xsl:call-template></td>
        <td><xsl:call-template name="date"/></td>
      </tr></xsl:for-each>
    </tbody></table></div></section>
  </xsl:template>
  <xsl:template match="s:urlset">
    <h1><bdi><xsl:call-template name="meta"><xsl:with-param name="key" select="'Name'"/></xsl:call-template></bdi></h1>
    <p class="muted">Page addresses, image URLs, publication dates and last updates.</p>
    <section class="stats" aria-label="Language sitemap statistics">
      <div class="stat"><strong><xsl:value-of select="count(s:url)"/></strong><span>Page URLs</span></div>
      <div class="stat"><strong><xsl:value-of select="count(s:url[s:lastmod])"/></strong><span>Known updates</span></div>
      <div class="stat"><strong><xsl:value-of select="count(s:url/i:image)"/></strong><span>Image entries</span></div>
      <div class="stat"><strong><xsl:value-of select="count(s:url/i:image/i:loc[generate-id()=generate-id(key('images',.)[1])])"/></strong><span>Unique images</span></div>
    </section>
    <section class="panel"><h2 class="panel-title">Pages</h2><div class="table-scroll"><table class="detail" aria-label="Page addresses"><thead><tr><th scope="col">Page URL</th><th scope="col">Images</th><th scope="col">Published</th><th scope="col">Last modified</th></tr></thead><tbody>
      <xsl:for-each select="s:url"><tr>
        <td class="url"><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
        <td><span class="count"><xsl:value-of select="count(i:image)"/></span><xsl:choose><xsl:when test="count(i:image) &gt; 5"><details><summary style="cursor:pointer;margin-top:8px;font-size:12px;">Show images</summary><xsl:call-template name="image-links"/></details></xsl:when><xsl:otherwise><xsl:if test="i:image"><xsl:call-template name="image-links"/></xsl:if></xsl:otherwise></xsl:choose></td>
        <td><xsl:choose><xsl:when test="contains(comment()[1],'Published:')"><time><xsl:attribute name="datetime"><xsl:call-template name="meta"><xsl:with-param name="key" select="'Published'"/></xsl:call-template></xsl:attribute><xsl:call-template name="meta"><xsl:with-param name="key" select="'Published'"/></xsl:call-template></time></xsl:when><xsl:otherwise><span class="muted">Not recorded</span></xsl:otherwise></xsl:choose></td><td><xsl:call-template name="date"/></td>
      </tr></xsl:for-each>
    </tbody></table></div></section>
  </xsl:template>
  <xsl:template name="image-links"><ul class="image-urls"><xsl:for-each select="i:image"><li><a href="{i:loc}"><xsl:value-of select="i:loc"/></a></li></xsl:for-each></ul></xsl:template>
  <xsl:template name="date"><xsl:choose><xsl:when test="s:lastmod"><time datetime="{s:lastmod}"><xsl:value-of select="s:lastmod"/></time></xsl:when><xsl:otherwise><span class="muted">Not recorded</span></xsl:otherwise></xsl:choose></xsl:template>
</xsl:stylesheet>
