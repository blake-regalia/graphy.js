BAT - WebTriples

BAT is a dynamic file format made up of nestable containers. It provides an extensible way to encode triples and their unique data in a binary format.

Differences to HDT

BAT is based on HDT. It employs many of the same data structures and algorithms used by the HDT format. Those familiar with HDT know that it can support arbitrary encodings for the Dictionary and Triples sections, and might wonder why anyone would deviate from such a binary format that seemingly imposes zero limitations to extensibility. However, since the primary focus of BAT is to enable high-performance web applications, the binary format is geared to operate with prefixes

The primary reason that BAT cannot 


Dictionary

BAT divides its dictionary up into 12 sections, analogously referred to as 'chapters'. Each chapter employs front-coding

h,s,p,o,lp,ll,lda,ldp


Chapter:

[vbyte shortestBlockLength] - length of the shortest block in bytes, used for dividing 

[BitSequence block index]

1.21, 1.62, 1.113, 1.5, 2.1, 1.3, 1.7

chunk_size
max_offset_to_next
max_number_of_chunks_in_block

ssss nnnn nnnn nnnn <-- 2 bytes per block

[vbyte C] - number of bytes per chunk - 1
[vbyte M] - number of bits for chunk multiplier

R - number of bits for remainder of block

R = C

(M + R) % 8 = 0

[uint{M} chunk] 
[uint{R} offset] 


Triples

ntu8-string encoding
vuint byteLength
{payload}


<http://bat-rdf.link/encoding/triples/bitmap?version=1.0#spo>
bitsequence bitmap_b
bitsequence bitmap_c
adjacency_list array_b
adjacency_list array_c
bitsequence closure_a
bitsequence closure_b
bitsequence closure_c


<http://bat-rdf.link/encoding/triples/bitmap?version=1.0#spo>
feature_map map
bitsequence bitmap_b
bitsequence bitmap_c
feature_list array_a
feature_embedded_adjacency_list array_b
feature_embedded_adjacency_list array_c
