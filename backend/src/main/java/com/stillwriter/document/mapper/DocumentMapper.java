package com.stillwriter.document.mapper;

import com.stillwriter.document.domain.Document;
import com.stillwriter.document.domain.NewDocument;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Mapper
public interface DocumentMapper {

    void insertDocument(NewDocument document);

    List<Document> findActiveDocumentsByUserId(@Param("userId") Long userId);

    Optional<Document> findActiveDocumentByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    Optional<Document> findActiveDocumentByIdAndUserIdForUpdate(@Param("id") Long id, @Param("userId") Long userId);

    boolean existsActiveDocumentByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    int updateDocument(@Param("id") Long id,
                       @Param("userId") Long userId,
                       @Param("expectedRevision") Long expectedRevision,
                       @Param("title") String title,
                       @Param("contentJson") String contentJson,
                       @Param("plainText") String plainText,
                       @Param("charCount") int charCount,
                       @Param("charCountWithoutSpaces") int charCountWithoutSpaces,
                       @Param("wordCount") int wordCount,
                       @Param("sentenceCount") int sentenceCount);

    boolean existsDocumentVersionRequest(@Param("documentId") Long documentId,
                                         @Param("saveRequestId") UUID saveRequestId);

    int findNextDocumentVersionNo(@Param("documentId") Long documentId);

    void insertDocumentVersion(@Param("documentId") Long documentId,
                               @Param("versionNo") int versionNo,
                               @Param("saveRequestId") UUID saveRequestId,
                               @Param("title") String title,
                               @Param("contentJson") String contentJson,
                               @Param("plainText") String plainText,
                               @Param("charCount") int charCount,
                               @Param("versionType") String versionType);

    int softDeleteDocument(@Param("id") Long id, @Param("userId") Long userId);
}
