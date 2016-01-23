import graphy from '../main';
import graph from '../../test/graph.json';

// graphy(graph);
/*{
	"@context": "http://json-ld.org/contexts/person.jsonld",
	"@id": "http://dbpedia.org/resource/John_Lennon",
	"name": "John Lennon",
	"born": "1940-10-09",
	"spouse": "http://dbpedia.org/resource/Cynthia_Lennon"
});*/

graphy({
  "@graph" : [ {
    "@id" : "_:b0",
    "@type" : "http://volt-name.space/ontology/YieldStage",
    "condition" : "_:b1"
  }, {
    "@id" : "_:b1",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "_:b54"
    },
    "operator" : "&&",
    "http://volt-name.space/ontology/rhs" : {
      "@id" : "_:b53"
    }
  }, {
    "@id" : "_:b100",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b197", "_:b117" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b101",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "http://volt-name.space/ontology/gets" : 0,
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b102",
    "@type" : "http://volt-name.space/ontology/SelectQuery",
    "http://volt-name.space/ontology/select" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?container"
      } ]
    },
    "where" : {
      "@list" : [ "_:b60", "_:b149" ]
    }
  }, {
    "@id" : "_:b103",
    "@type" : "http://volt-name.space/ontology/BasicGraphPattern",
    "triples" : {
      "@list" : [ "_:b179", "_:b73" ]
    }
  }, {
    "@id" : "_:b107",
    "@type" : "http://volt-name.space/ontology/FunctionArgument",
    "filter" : "http://volt-name.space/ontology/IsIri",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?sourceUnit"
    }
  }, {
    "@id" : "_:b110",
    "@type" : "http://volt-name.space/ontology/SelectTransformation",
    "http://volt-name.space/ontology/arguments" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?geom"
      } ]
    },
    "transform" : "http://volt-name.space/ontology/collect",
    "variable" : "?geoms"
  }, {
    "@id" : "_:b113",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?value",
    "http://volt-name.space/ontology/predicate" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?property"
    },
    "subject" : "?part"
  }, {
    "@id" : "_:b114",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?part",
    "predicate" : "_:b40",
    "subject" : "?parts"
  }, {
    "@id" : "_:b115",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b116",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "1.5707963267948966",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b117",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "http://volt-name.space/ontology/gets" : 0,
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b119",
    "@type" : "http://volt-name.space/ontology/QueryStage",
    "variable:s" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?sourceToBaseMultiplier"
      }, {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?sourceToBaseOffset"
      }, {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?baseToTargetMultiplier"
      }, {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?baseToTargetOffset"
      } ]
    },
    "where" : {
      "@list" : [ "_:b203" ]
    }
  }, {
    "@id" : "_:b12",
    "@type" : "http://volt-name.space/ontology/IfThenElse",
    "else" : {
      "@list" : [ "_:b56" ]
    },
    "if" : "_:b198",
    "then" : {
      "@list" : [ "_:b127", "_:b25" ]
    }
  }, {
    "@id" : "_:b123",
    "@type" : "http://volt-name.space/ontology/EvaluateStage",
    "evaluate" : [ "_:b15", "_:b217" ]
  }, {
    "@id" : "_:b124",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?upper",
    "operator" : "%",
    "http://volt-name.space/ontology/rhs" : {
      "@type" : "xsd:decimal",
      "@value" : "6.283185307179586"
    }
  }, {
    "@id" : "_:b126",
    "@type" : "http://volt-name.space/ontology/ReturnStage",
    "value" : "?targetValue"
  }, {
    "@id" : "_:b127",
    "@type" : "http://volt-name.space/ontology/EvaluateStage",
    "evaluate" : "_:b128"
  }, {
    "@id" : "_:b128",
    "expression" : "_:b143",
    "variable" : "?lower"
  }, {
    "@id" : "_:b129",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:southwest",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b82"
  }, {
    "@id" : "_:b130",
    "@type" : "http://volt-name.space/ontology/FunctionCall",
    "http://volt-name.space/ontology/arguments" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?geometryA"
      }, {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?geometryB"
      } ]
    },
    "http://volt-name.space/ontology/function" : {
      "@id" : "http://postgis.net/function/azimuth"
    }
  }, {
    "@id" : "_:b132",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.39269908169872414",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b133",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b88", "_:b51" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b134",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b132", "_:b101" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b137",
    "@type" : "http://volt-name.space/ontology/EvaluateStage",
    "evaluate" : "_:b175"
  }, {
    "@id" : "_:b139",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?sourceToBaseOffset",
    "predicate" : "http://qudt.org/schema/qudt#conversionOffset",
    "subject" : "?sourceUnit"
  }, {
    "@id" : "_:b14",
    "@type" : "http://volt-name.space/ontology/EvaluateStage",
    "evaluate" : "_:b55"
  }, {
    "@id" : "_:b140",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "1.5707963267948966",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b141",
    "@type" : "http://volt-name.space/ontology/FunctionCall",
    "http://volt-name.space/ontology/arguments" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?value"
      } ]
    },
    "http://volt-name.space/ontology/function" : {
      "@type" : "http://volt-name.space/ontology/SelectFunction",
      "@value" : "sum"
    }
  }, {
    "@id" : "_:b143",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "_:b79"
    },
    "operator" : "%",
    "http://volt-name.space/ontology/rhs" : {
      "@type" : "xsd:decimal",
      "@value" : "6.283185307179586"
    }
  }, {
    "@id" : "_:b144",
    "property" : "http://volt-name.space/vocab/output#coverage",
    "value" : "?coverage"
  }, {
    "@id" : "_:b146",
    "@type" : "http://volt-name.space/ontology/Filter",
    "expression" : "_:b224"
  }, {
    "@id" : "_:b149",
    "@type" : "http://volt-name.space/ontology/Filter",
    "expression" : "_:b154"
  }, {
    "@id" : "_:b15",
    "expression" : "_:b16",
    "variable" : "?upper"
  }, {
    "@id" : "_:b151",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:directlyEast",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b152"
  }, {
    "@id" : "_:b152",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b27", "_:b116" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b153",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?baseToTargetMultiplier",
    "predicate" : "http://qudt.org/schema/qudt#conversionMultiplier",
    "subject" : "?targetUnit"
  }, {
    "@id" : "_:b154",
    "@type" : "http://volt-name.space/ontology/FunctionCall",
    "http://volt-name.space/ontology/arguments" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?container"
      }, {
        "@type" : "http://volt-name.space/ontology/Literal",
        "@value" : "^(MULTI)?POLYGON"
      } ]
    },
    "function" : "regex"
  }, {
    "@id" : "_:b155",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "4.71238898038469",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b156",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:east",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b157"
  }, {
    "@id" : "_:b157",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b225", "_:b140" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b16",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?heading",
    "operator" : "+",
    "http://volt-name.space/ontology/rhs" : {
      "@id" : "_:b165"
    }
  }, {
    "@id" : "_:b162",
    "@type" : "http://volt-name.space/ontology/OutputStage",
    "output" : "_:b144"
  }, {
    "@id" : "_:b163",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:northwest",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b164"
  }, {
    "@id" : "_:b164",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b228", "_:b191" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b165",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?spread",
    "operator" : "/",
    "http://volt-name.space/ontology/rhs" : 2
  }, {
    "@id" : "_:b166",
    "from" : "http://volt-name.space/ontology/ThisObject",
    "property" : "http://volt-name.space/vocab/input#property",
    "variable" : "?property"
  }, {
    "@id" : "_:b167",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:directlySouth",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b133"
  }, {
    "@id" : "_:b170",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?sourceToBaseOffset",
    "predicate" : "http://qudt.org/schema/qudt#conversionOffset",
    "subject" : "?sourceUnit"
  }, {
    "@id" : "_:b172",
    "@type" : "http://volt-name.space/ontology/YieldStage",
    "condition" : "_:b196"
  }, {
    "@id" : "_:b173",
    "@type" : "http://volt-name.space/ontology/SelectExpression",
    "expression" : "_:b141",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?sum"
    }
  }, {
    "@id" : "_:b175",
    "expression" : "_:b74",
    "variable" : "?baseValue"
  }, {
    "@id" : "_:b177",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?spread",
    "operator" : "/",
    "http://volt-name.space/ontology/rhs" : 2
  }, {
    "@id" : "_:b178",
    "expression" : "_:b52",
    "variable" : "?baseValue"
  }, {
    "@id" : "_:b179",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?geometryA",
    "predicate" : "geo:geometry",
    "http://volt-name.space/ontology/subject" : {
      "@id" : "http://volt-name.space/ontology/ThisSubject"
    }
  }, {
    "@id" : "_:b181",
    "@type" : "http://volt-name.space/ontology/ExtractionStage",
    "extract" : [ "_:b166", "_:b229" ]
  }, {
    "@id" : "_:b182",
    "@type" : "http://volt-name.space/ontology/FunctionArgument",
    "filter" : "http://volt-name.space/ontology/IsIri",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/variable",
      "@value" : "?targetUnit"
    },
    "http://volt-name.space/ontology/optional" : true
  }, {
    "@id" : "_:b183",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?heading",
    "operator" : "-",
    "http://volt-name.space/ontology/rhs" : {
      "@id" : "_:b177"
    }
  }, {
    "@id" : "_:b184",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "_:b87"
    },
    "operator" : "+",
    "rhs" : "?baseToTargetOffset"
  }, {
    "@id" : "_:b185",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b115", "_:b155" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b186",
    "@type" : "http://volt-name.space/ontology/FunctionCall",
    "http://volt-name.space/ontology/arguments" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?container"
      }, {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?geom"
      } ]
    },
    "http://volt-name.space/ontology/function" : {
      "@id" : "http://postgis.net/function/contains"
    }
  }, {
    "@id" : "_:b19",
    "@type" : "http://volt-name.space/ontology/QueryStage",
    "query" : "_:b102"
  }, {
    "@id" : "_:b190",
    "@type" : "http://volt-name.space/ontology/ReturnStage",
    "value" : "?baseValue"
  }, {
    "@id" : "_:b191",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "5.497787143782138",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b195",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:south",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b36"
  }, {
    "@id" : "_:b196",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "_:b223"
    },
    "operator" : "||",
    "http://volt-name.space/ontology/rhs" : {
      "@id" : "_:b208"
    }
  }, {
    "@id" : "_:b197",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b198",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?lower",
    "operator" : "<",
    "http://volt-name.space/ontology/rhs" : 0
  }, {
    "@id" : "_:b199",
    "@type" : "http://volt-name.space/ontology/Filter",
    "expression" : "_:b80"
  }, {
    "@id" : "_:b2",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:southeast",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b3"
  }, {
    "@id" : "_:b200",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b201", "_:b28" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b201",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    },
    "property" : "stko:spread"
  }, {
    "@id" : "_:b203",
    "@type" : "http://volt-name.space/ontology/BasicGraphPattern",
    "triples" : {
      "@list" : [ "_:b91", "_:b139", "_:b153", "_:b43" ]
    }
  }, {
    "@id" : "_:b204",
    "@type" : "http://volt-name.space/ontology/EvaluateStage",
    "evaluate" : "_:b205"
  }, {
    "@id" : "_:b205",
    "expression" : "_:b206",
    "variable" : "?coverage"
  }, {
    "@id" : "_:b206",
    "@type" : "http://volt-name.space/ontology/FunctionCall",
    "http://volt-name.space/ontology/arguments" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?geoms"
      } ]
    },
    "http://volt-name.space/ontology/function" : {
      "@id" : "http://postgis.net/function/union"
    }
  }, {
    "@id" : "_:b207",
    "@type" : "http://volt-name.space/ontology/FunctionCall",
    "http://volt-name.space/ontology/arguments" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?value"
      } ]
    },
    "function" : "isNumeric"
  }, {
    "@id" : "_:b208",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?bearing",
    "operator" : "<",
    "rhs" : "?upper"
  }, {
    "@id" : "_:b209",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?sourceToBaseMultiplier",
    "predicate" : "http://qudt.org/schema/qudt#conversionMultiplier",
    "subject" : "?sourceUnit"
  }, {
    "@id" : "_:b210",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "2.356194490192345",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b212",
    "@type" : "http://volt-name.space/ontology/QueryStage",
    "variable:s" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?sourceToBaseMultiplier"
      }, {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?sourceToBaseOffset"
      } ]
    },
    "where" : {
      "@list" : [ "_:b66" ]
    }
  }, {
    "@id" : "_:b216",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:directlyNorth",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b134"
  }, {
    "@id" : "_:b217",
    "expression" : "_:b183",
    "variable" : "?lower"
  }, {
    "@id" : "_:b218",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?container",
    "predicate" : "geo:geometry",
    "http://volt-name.space/ontology/subject" : {
      "@id" : "http://volt-name.space/ontology/ThisSubject"
    }
  }, {
    "@id" : "_:b219",
    "@type" : "http://volt-name.space/ontology/Function",
    "arguments" : {
      "@list" : [ "_:b85", "_:b107", "_:b182" ]
    },
    "name" : "http://qudt.org/vocab/unit#convert",
    "stages" : {
      "@list" : [ "_:b222" ]
    }
  }, {
    "@id" : "_:b22",
    "property" : "http://volt-name.space/vocab/output#sum",
    "value" : "?sum"
  }, {
    "@id" : "_:b222",
    "@type" : "http://volt-name.space/ontology/IfThenElse",
    "else" : {
      "@list" : [ "_:b119", "_:b47", "_:b70", "_:b126" ]
    },
    "if" : "_:b39",
    "then" : {
      "@list" : [ "_:b212", "_:b137", "_:b190" ]
    }
  }, {
    "@id" : "_:b223",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?bearing",
    "operator" : ">=",
    "rhs" : "?lower"
  }, {
    "@id" : "_:b224",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "http://volt-name.space/ontology/ThisSubject"
    },
    "operator" : "!=",
    "http://volt-name.space/ontology/rhs" : {
      "@id" : "http://volt-name.space/ontology/ThisObject"
    }
  }, {
    "@id" : "_:b225",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b227",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?geom",
    "predicate" : "geo:geometry",
    "subject" : "?part"
  }, {
    "@id" : "_:b228",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b229",
    "from" : "http://volt-name.space/ontology/ThisObject",
    "property" : "http://volt-name.space/vocab/input#parts",
    "variable" : "?parts"
  }, {
    "@id" : "_:b23",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:directlyWest",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b24"
  }, {
    "@id" : "_:b230",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:west",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b185"
  }, {
    "@id" : "_:b231",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:northeast",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b33"
  }, {
    "@id" : "_:b24",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b76", "_:b67" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b25",
    "@type" : "http://volt-name.space/ontology/YieldStage",
    "condition" : "_:b26"
  }, {
    "@id" : "_:b26",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "_:b30"
    },
    "operator" : "||",
    "http://volt-name.space/ontology/rhs" : {
      "@id" : "_:b29"
    }
  }, {
    "@id" : "_:b27",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.39269908169872414",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b28",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    },
    "property" : "stko:heading"
  }, {
    "@id" : "_:b29",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?bearing",
    "operator" : "<",
    "rhs" : "?upper"
  }, {
    "@id" : "_:b3",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b86", "_:b210" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b30",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?bearing",
    "operator" : ">=",
    "rhs" : "?lower"
  }, {
    "@id" : "_:b31",
    "@type" : "http://volt-name.space/ontology/QueryStage",
    "query" : "_:b32"
  }, {
    "@id" : "_:b32",
    "@type" : "http://volt-name.space/ontology/SelectQuery",
    "http://volt-name.space/ontology/select" : {
      "@list" : [ {
        "@id" : "http://volt-name.space/ontology/ThisSubject"
      }, {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?geometryA"
      }, {
        "@id" : "http://volt-name.space/ontology/ThisObject"
      }, {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?geometryB"
      } ]
    },
    "where" : {
      "@list" : [ "_:b103", "_:b146" ]
    }
  }, {
    "@id" : "_:b33",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b34", "_:b35" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b34",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b35",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b36",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b37", "_:b38" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b37",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b38",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "3.141592653589793",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b39",
    "@type" : "http://volt-name.space/ontology/Operation",
    "operator" : "no",
    "rhs" : "?targetUnit"
  }, {
    "@id" : "_:b4",
    "@type" : "http://volt-name.space/ontology/Method",
    "name" : "stko:sumOfParts",
    "stages" : {
      "@list" : [ "_:b181", "_:b19", "_:b44", "_:b94", "_:b50" ]
    }
  }, {
    "@id" : "_:b40",
    "@type" : "http://volt-name.space/ontology/PropertyPath",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "_:b41"
    },
    "pathType" : "/",
    "http://volt-name.space/ontology/rhs" : {
      "@id" : "rdf:first"
    }
  }, {
    "@id" : "_:b41",
    "@type" : "http://volt-name.space/ontology/PropertyPath",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "rdf:rest"
    },
    "pathType" : "*"
  }, {
    "@id" : "_:b43",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?baseToTargetOffset",
    "predicate" : "http://qudt.org/schema/qudt#conversionOffset",
    "subject" : "?targetUnit"
  }, {
    "@id" : "_:b44",
    "@type" : "http://volt-name.space/ontology/QueryStage",
    "query" : "_:b8"
  }, {
    "@id" : "_:b47",
    "@type" : "http://volt-name.space/ontology/EvaluateStage",
    "evaluate" : "_:b178"
  }, {
    "@id" : "_:b50",
    "@type" : "http://volt-name.space/ontology/IfThenElse",
    "if" : "_:b7",
    "then" : {
      "@list" : [ "_:b204", "_:b162" ]
    }
  }, {
    "@id" : "_:b51",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "3.141592653589793",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b52",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "_:b6"
    },
    "operator" : "+",
    "rhs" : "?sourceToBaseOffset"
  }, {
    "@id" : "_:b53",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?bearing",
    "operator" : "<",
    "rhs" : "?upper"
  }, {
    "@id" : "_:b54",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?bearing",
    "operator" : ">=",
    "rhs" : "?lower"
  }, {
    "@id" : "_:b55",
    "expression" : "_:b130",
    "variable" : "?bearing"
  }, {
    "@id" : "_:b56",
    "@type" : "http://volt-name.space/ontology/IfThenElse",
    "else" : {
      "@list" : [ "_:b0" ]
    },
    "if" : "_:b59",
    "then" : {
      "@list" : [ "_:b62", "_:b172" ]
    }
  }, {
    "@id" : "_:b59",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?upper",
    "operator" : ">",
    "http://volt-name.space/ontology/rhs" : {
      "@type" : "xsd:decimal",
      "@value" : "6.283185307179586"
    }
  }, {
    "@id" : "_:b6",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?sourceValue",
    "operator" : "*",
    "rhs" : "?sourceToBaseMultiplier"
  }, {
    "@id" : "_:b60",
    "@type" : "http://volt-name.space/ontology/BasicGraphPattern",
    "triples" : {
      "@list" : [ "_:b218" ]
    }
  }, {
    "@id" : "_:b62",
    "@type" : "http://volt-name.space/ontology/EvaluateStage",
    "evaluate" : "_:b63"
  }, {
    "@id" : "_:b63",
    "expression" : "_:b124",
    "variable" : "?upper"
  }, {
    "@id" : "_:b66",
    "@type" : "http://volt-name.space/ontology/BasicGraphPattern",
    "triples" : {
      "@list" : [ "_:b209", "_:b170" ]
    }
  }, {
    "@id" : "_:b67",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "4.71238898038469",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b69",
    "@type" : "http://volt-name.space/ontology/BasicGraphPattern",
    "triples" : {
      "@list" : [ "_:b113", "_:b227", "_:b114" ]
    }
  }, {
    "@id" : "_:b7",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "http://volt-name.space/ontology/ThisObject"
    },
    "operator" : "has",
    "http://volt-name.space/ontology/rhs" : {
      "@id" : "http://volt-name.space/vocab/output#coverage"
    }
  }, {
    "@id" : "_:b70",
    "@type" : "http://volt-name.space/ontology/EvaluateStage",
    "evaluate" : "_:b71"
  }, {
    "@id" : "_:b71",
    "expression" : "_:b184",
    "variable" : "?targetValue"
  }, {
    "@id" : "_:b73",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?geometryB",
    "predicate" : "geo:geometry",
    "http://volt-name.space/ontology/subject" : {
      "@id" : "http://volt-name.space/ontology/ThisObject"
    }
  }, {
    "@id" : "_:b74",
    "@type" : "http://volt-name.space/ontology/Operation",
    "http://volt-name.space/ontology/lhs" : {
      "@id" : "_:b75"
    },
    "operator" : "+",
    "rhs" : "?sourceToBaseOffset"
  }, {
    "@id" : "_:b75",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?sourceValue",
    "operator" : "*",
    "rhs" : "?sourceToBaseMultiplier"
  }, {
    "@id" : "_:b76",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.39269908169872414",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b79",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?lower",
    "operator" : "+",
    "http://volt-name.space/ontology/rhs" : {
      "@type" : "xsd:decimal",
      "@value" : "6.283185307179586"
    }
  }, {
    "@id" : "_:b8",
    "@type" : "http://volt-name.space/ontology/SelectQuery",
    "select" : {
      "@list" : [ "_:b110", "_:b173" ]
    },
    "where" : {
      "@list" : [ "_:b69", "_:b199", "_:b98", "_:b96" ]
    }
  }, {
    "@id" : "_:b80",
    "@type" : "http://volt-name.space/ontology/FunctionCall",
    "http://volt-name.space/ontology/arguments" : {
      "@list" : [ {
        "@type" : "http://volt-name.space/ontology/Variable",
        "@value" : "?geom"
      }, {
        "@type" : "http://volt-name.space/ontology/Literal",
        "@value" : "^(MULTI)?POLYGON"
      } ]
    },
    "function" : "regex"
  }, {
    "@id" : "_:b82",
    "@type" : "http://volt-name.space/ontology/Group",
    "item" : [ "_:b83", "_:b84" ],
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?direction"
    }
  }, {
    "@id" : "_:b83",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b84",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "3.9269908169872414",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?heading"
    }
  }, {
    "@id" : "_:b85",
    "@type" : "http://volt-name.space/ontology/FunctionArgument",
    "filter" : "http://volt-name.space/ontology/IsNumeric",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?sourceValue"
    }
  }, {
    "@id" : "_:b86",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.7853981633974483",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b87",
    "@type" : "http://volt-name.space/ontology/Operation",
    "lhs" : "?baseValue",
    "operator" : "*",
    "rhs" : "?baseToTargetMultiplier"
  }, {
    "@id" : "_:b88",
    "@type" : "http://volt-name.space/ontology/Assignment",
    "gets" : "0.39269908169872414",
    "http://volt-name.space/ontology/name" : {
      "@type" : "http://volt-name.space/ontology/Variable",
      "@value" : "?spread"
    }
  }, {
    "@id" : "_:b91",
    "@type" : "http://volt-name.space/ontology/Triple",
    "object" : "?sourceToBaseMultiplier",
    "predicate" : "http://qudt.org/schema/qudt#conversionMultiplier",
    "subject" : "?sourceUnit"
  }, {
    "@id" : "_:b94",
    "@type" : "http://volt-name.space/ontology/OutputStage",
    "output" : "_:b22"
  }, {
    "@id" : "_:b96",
    "@type" : "http://volt-name.space/ontology/Filter",
    "expression" : "_:b186"
  }, {
    "@id" : "_:b98",
    "@type" : "http://volt-name.space/ontology/Filter",
    "expression" : "_:b207"
  }, {
    "@id" : "_:b99",
    "@type" : "http://volt-name.space/ontology/Property",
    "extends" : "stko:PointsTowards",
    "name" : "stko:north",
    "http://volt-name.space/ontology/stages" : {
      "@list" : [ ]
    },
    "using" : "_:b100"
  }, {
    "@id" : "stko:PointsTowards",
    "@type" : "http://volt-name.space/ontology/AbstractProperty",
    "abstractField" : "_:b200",
    "stages" : {
      "@list" : [ "_:b123", "_:b31", "_:b14", "_:b12" ]
    },
    "http://volt-name.space/ontology/version" : "indicates if subject points ?direction towards object"
  } ],
  "@context" : {
    "condition" : {
      "@id" : "http://volt-name.space/ontology/condition",
      "@type" : "@id"
    },
    "using" : {
      "@id" : "http://volt-name.space/ontology/using",
      "@type" : "@id"
    },
    "extends" : {
      "@id" : "http://volt-name.space/ontology/extends",
      "@type" : "@id"
    },
    "stages" : {
      "@id" : "http://volt-name.space/ontology/stages",
      "@type" : "@id"
    },
    "name" : {
      "@id" : "http://volt-name.space/ontology/name",
      "@type" : "@id"
    },
    "rhs" : {
      "@id" : "http://volt-name.space/ontology/rhs",
      "@type" : "http://volt-name.space/ontology/Variable"
    },
    "lhs" : {
      "@id" : "http://volt-name.space/ontology/lhs",
      "@type" : "http://volt-name.space/ontology/Variable"
    },
    "operator" : {
      "@id" : "http://volt-name.space/ontology/operator",
      "@type" : "http://volt-name.space/ontology/Operator"
    },
    "where" : {
      "@id" : "http://volt-name.space/ontology/where",
      "@type" : "@id"
    },
    "select" : {
      "@id" : "http://volt-name.space/ontology/select",
      "@type" : "@id"
    },
    "rest" : {
      "@id" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
      "@type" : "@id"
    },
    "first" : {
      "@id" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
      "@type" : "@id"
    },
    "expression" : {
      "@id" : "http://volt-name.space/ontology/expression",
      "@type" : "@id"
    },
    "variable" : {
      "@id" : "http://volt-name.space/ontology/variable",
      "@type" : "http://volt-name.space/ontology/Variable"
    },
    "value" : {
      "@id" : "http://volt-name.space/ontology/value",
      "@type" : "http://volt-name.space/ontology/Variable"
    },
    "property" : {
      "@id" : "http://volt-name.space/ontology/property",
      "@type" : "@id"
    },
    "gets" : {
      "@id" : "http://volt-name.space/ontology/gets",
      "@type" : "http://www.w3.org/2001/XMLSchema#decimal"
    },
    "query" : {
      "@id" : "http://volt-name.space/ontology/query",
      "@type" : "@id"
    },
    "item" : {
      "@id" : "http://volt-name.space/ontology/item",
      "@type" : "@id"
    },
    "pathType" : {
      "@id" : "http://volt-name.space/ontology/pathType",
      "@type" : "http://volt-name.space/ontology/Operator"
    },
    "evaluate" : {
      "@id" : "http://volt-name.space/ontology/evaluate",
      "@type" : "@id"
    },
    "else" : {
      "@id" : "http://volt-name.space/ontology/else",
      "@type" : "@id"
    },
    "then" : {
      "@id" : "http://volt-name.space/ontology/then",
      "@type" : "@id"
    },
    "if" : {
      "@id" : "http://volt-name.space/ontology/if",
      "@type" : "@id"
    },
    "triples" : {
      "@id" : "http://volt-name.space/ontology/triples",
      "@type" : "@id"
    },
    "arguments" : {
      "@id" : "http://volt-name.space/ontology/arguments",
      "@type" : "@id"
    },
    "function" : {
      "@id" : "http://volt-name.space/ontology/function",
      "@type" : "http://volt-name.space/ontology/Function"
    },
    "filter" : {
      "@id" : "http://volt-name.space/ontology/filter",
      "@type" : "@id"
    },
    "output" : {
      "@id" : "http://volt-name.space/ontology/output",
      "@type" : "@id"
    },
    "object" : {
      "@id" : "http://volt-name.space/ontology/object",
      "@type" : "http://volt-name.space/ontology/Variable"
    },
    "predicate" : {
      "@id" : "http://volt-name.space/ontology/predicate",
      "@type" : "@id"
    },
    "subject" : {
      "@id" : "http://volt-name.space/ontology/subject",
      "@type" : "http://volt-name.space/ontology/Variable"
    },
    "from" : {
      "@id" : "http://volt-name.space/ontology/from",
      "@type" : "@id"
    },
    "transform" : {
      "@id" : "http://volt-name.space/ontology/transform",
      "@type" : "@id"
    },
    "optional" : {
      "@id" : "http://volt-name.space/ontology/optional",
      "@type" : "http://www.w3.org/2001/XMLSchema#boolean"
    },
    "variables" : {
      "@id" : "http://volt-name.space/ontology/variables",
      "@type" : "@id"
    },
    "abstractField" : {
      "@id" : "http://volt-name.space/ontology/abstractField",
      "@type" : "@id"
    },
    "version" : {
      "@id" : "http://volt-name.space/ontology/version",
      "@type" : "http://www.w3.org/2001/XMLSchema#string"
    },
    "extract" : {
      "@id" : "http://volt-name.space/ontology/extract",
      "@type" : "@id"
    },
    "geo" : "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "stko" : "http://stko.geog.ucsb.edu/vocab/",
    "rdf" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "owl" : "http://www.w3.org/2002/07/owl#",
    "dbr" : "http://dbpedia.org/resource/",
    "xsd" : "http://www.w3.org/2001/XMLSchema#",
    "rdfs" : "http://www.w3.org/2000/01/rdf-schema#",
    "postgis" : "http://postgis.net/docs/manual-2.2/"
  }
}
);